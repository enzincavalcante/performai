"""Queue and scheduler boundaries for automated micro-learning."""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Protocol

from .performance_models import MicroLearningAssignment, SkillDimension


class MicroLearningQueue(Protocol):
    async def enqueue(self, assignment: MicroLearningAssignment) -> bool:
        """Enqueue an assignment, returning False when it already exists."""


class MicroLearningScheduler(Protocol):
    def schedule(self, seller_id: str, skill: SkillDimension, reason: str) -> MicroLearningAssignment:
        """Create an assignment ready for a background queue."""


class NextDayMicroLearningScheduler:
    SCENARIOS = {
        SkillDimension.QUALIFICATION: "discovery_and_qualification",
        SkillDimension.OBJECTION_HANDLING: "objection_recovery",
        SkillDimension.CLOSING: "closing_commitment",
        SkillDimension.CONFIDENCE: "executive_presence",
        SkillDimension.CLARITY: "concise_value_pitch",
        SkillDimension.VALUE_FRAMING: "quantified_value",
    }

    def schedule(self, seller_id: str, skill: SkillDimension, reason: str) -> MicroLearningAssignment:
        from hashlib import sha256

        scheduled_for = datetime.now(timezone.utc) + timedelta(days=1)
        key = f"{seller_id}:{skill.value}:{scheduled_for.date().isoformat()}"
        assignment_id = sha256(key.encode()).hexdigest()[:20]
        return MicroLearningAssignment(
            assignment_id=assignment_id,
            seller_id=seller_id,
            skill=skill,
            scenario_template=self.SCENARIOS[skill],
            reason=reason,
            scheduled_for=scheduled_for,
        )


class InMemoryMicroLearningQueue:
    """Development adapter; replace with a durable worker queue in production."""

    def __init__(self):
        self._items: Dict[str, MicroLearningAssignment] = {}

    async def enqueue(self, assignment: MicroLearningAssignment) -> bool:
        if assignment.assignment_id in self._items:
            return False
        self._items[assignment.assignment_id] = assignment
        return True

    def pending(self) -> List[MicroLearningAssignment]:
        return list(self._items.values())
