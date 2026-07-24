"""Skill-gap aggregation and conversion risk estimation."""

from collections import defaultdict
from datetime import datetime, timezone
from statistics import fmean
from typing import Dict, Iterable, List

from .micro_learning import MicroLearningQueue, MicroLearningScheduler
from .performance_models import (
    SellerRisk,
    SellerSessions,
    SkillDimension,
    SkillGap,
    TeamRiskMatrixResponse,
)


class SalesPerformancePredictor:
    def __init__(self, queue: MicroLearningQueue, scheduler: MicroLearningScheduler):
        self.queue = queue
        self.scheduler = scheduler

    async def build_team_risk_matrix(
        self,
        sellers: Iterable[SellerSessions],
        session_window: int = 5,
        assignment_threshold: float = 6.0,
    ) -> TeamRiskMatrixResponse:
        seller_risks = [
            await self._analyze_seller(seller, session_window, assignment_threshold)
            for seller in sellers
        ]
        dimension_gaps: Dict[SkillDimension, List[float]] = defaultdict(list)
        for seller in seller_risks:
            for gap in seller.skill_gaps:
                dimension_gaps[gap.dimension].append(gap.gap_to_target)

        return TeamRiskMatrixResponse(
            generated_at=datetime.now(timezone.utc),
            sellers=seller_risks,
            team_skill_gaps={
                dimension: round(fmean(gaps), 2)
                for dimension, gaps in dimension_gaps.items()
            },
            high_risk_sellers=sum(seller.risk_level == "high" for seller in seller_risks),
        )

    async def _analyze_seller(self, seller, session_window, threshold):
        sessions = sorted(seller.sessions, key=lambda item: item.completed_at)[-session_window:]
        scores_by_skill = defaultdict(list)
        for session in sessions:
            for dimension, score in session.scores.items():
                scores_by_skill[dimension].append(score)

        gaps = []
        assignments = []
        for dimension, scores in scores_by_skill.items():
            average = fmean(scores)
            midpoint = max(1, len(scores) // 2)
            earlier, recent = scores[:midpoint], scores[midpoint:]
            trend = fmean(recent) - fmean(earlier) if recent else 0.0
            gap = SkillGap(
                dimension=dimension,
                average_score=round(average, 2),
                gap_to_target=round(max(0.0, threshold - average), 2),
                sample_size=len(scores),
                trend=round(trend, 2),
            )
            gaps.append(gap)
            if average < threshold:
                assignment = self.scheduler.schedule(
                    seller.seller_id,
                    dimension,
                    f"Media {average:.1f}, abaixo do limite {threshold:.1f}",
                )
                await self.queue.enqueue(assignment)
                assignments.append(assignment)

        # Risk is the normalized distance from a strong benchmark (8/10).
        overall = fmean(gap.average_score for gap in gaps) if gaps else 0.0
        risk = round(min(1.0, max(0.0, (8.0 - overall) / 8.0)), 3)
        risk_level = "high" if risk >= 0.5 else "medium" if risk >= 0.25 else "low"
        return SellerRisk(
            seller_id=seller.seller_id,
            seller_name=seller.seller_name,
            sessions_analyzed=len(sessions),
            skill_gaps=sorted(gaps, key=lambda gap: gap.gap_to_target, reverse=True),
            predicted_conversion_risk=risk,
            risk_level=risk_level,
            assignments=assignments,
        )
