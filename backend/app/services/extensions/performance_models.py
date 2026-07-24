"""Contracts used by predictive performance extensions.

These models are deliberately separate from the core scorecard contract so the
extension can evolve without changing existing API responses or persistence.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class SkillDimension(str, Enum):
    QUALIFICATION = "qualification"
    OBJECTION_HANDLING = "objection_handling"
    CLOSING = "closing"
    CONFIDENCE = "confidence"
    CLARITY = "clarity"
    VALUE_FRAMING = "value_framing"


class SessionScorecard(BaseModel):
    session_id: str = Field(min_length=1)
    seller_id: str = Field(min_length=1)
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scores: Dict[SkillDimension, float]

    @field_validator("scores")
    @classmethod
    def validate_scores(cls, scores: Dict[SkillDimension, float]):
        if not scores:
            raise ValueError("at least one skill score is required")
        if any(score < 0 or score > 10 for score in scores.values()):
            raise ValueError("skill scores must be between 0 and 10")
        return scores


class SellerSessions(BaseModel):
    seller_id: str = Field(min_length=1)
    seller_name: Optional[str] = None
    sessions: List[SessionScorecard]

    @field_validator("sessions")
    @classmethod
    def sessions_belong_to_seller(cls, sessions, info):
        seller_id = info.data.get("seller_id")
        if any(session.seller_id != seller_id for session in sessions):
            raise ValueError("all sessions must belong to seller_id")
        return sessions


class TeamRiskMatrixRequest(BaseModel):
    sellers: List[SellerSessions]
    session_window: int = Field(default=5, ge=1, le=100)
    assignment_threshold: float = Field(default=6.0, ge=0, le=10)


class SkillGap(BaseModel):
    dimension: SkillDimension
    average_score: float
    gap_to_target: float
    sample_size: int
    trend: float


class MicroLearningAssignment(BaseModel):
    assignment_id: str
    seller_id: str
    skill: SkillDimension
    scenario_template: str
    reason: str
    scheduled_for: datetime


class SellerRisk(BaseModel):
    seller_id: str
    seller_name: Optional[str] = None
    sessions_analyzed: int
    skill_gaps: List[SkillGap]
    predicted_conversion_risk: float
    risk_level: str
    assignments: List[MicroLearningAssignment]


class TeamRiskMatrixResponse(BaseModel):
    generated_at: datetime
    sellers: List[SellerRisk]
    team_skill_gaps: Dict[SkillDimension, float]
    high_risk_sellers: int
