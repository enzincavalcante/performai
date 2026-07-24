from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StressLevel(str, Enum):
    NORMAL = "NORMAL"
    AGGRESSIVE_DISCOUNT_SEEKER = "AGGRESSIVE_DISCOUNT_SEEKER"
    COMPETITOR_LOYALIST = "COMPETITOR_LOYALIST"
    HOSTILE_EXECUTIVE = "HOSTILE_EXECUTIVE"


class AgentPersonaConfigExtension(BaseModel):
    """Append-only persona options that can be composed with the core config."""

    stress_level: StressLevel = StressLevel.NORMAL
    stress_intensity: float = Field(default=0.0, ge=0.0, le=1.0)

    @field_validator("stress_intensity", mode="before")
    @classmethod
    def default_none_to_zero(cls, value: Any) -> Any:
        return 0.0 if value is None else value


class CRMDealPayload(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    lead_name: str | None = Field(default=None, max_length=160)
    company: str | None = Field(default=None, max_length=200)
    industry: str | None = Field(default=None, max_length=160)
    deal_value: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=8)
    last_stage: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=6000)
    transcripts: list[str] = Field(default_factory=list, max_length=30)
    loss_reason: str | None = Field(default=None, max_length=1000)

    @field_validator("transcripts")
    @classmethod
    def bound_transcripts(cls, values: list[str]) -> list[str]:
        return [" ".join(value.split())[:4000] for value in values if value.strip()]


class RecreateLostDealRequest(BaseModel):
    deal: CRMDealPayload
    persona_id: str = Field(default="skeptic", min_length=1, max_length=80)
    stress: AgentPersonaConfigExtension = Field(
        default_factory=AgentPersonaConfigExtension
    )


class FailurePoint(BaseModel):
    category: str
    stage: str
    evidence: str
    confidence: float = Field(ge=0.0, le=1.0)


class RecreatedSimulation(BaseModel):
    simulation_id: str
    simulation_type: str = "lost_deal_recreation"
    persona_id: str
    locked_bottleneck: FailurePoint
    pre_call_context: dict[str, str]
    system_prompt: str
    stress_level: StressLevel
    stress_intensity: float
    session_config: dict[str, Any]


class MarginProtectionResult(BaseModel):
    score: int = Field(ge=0, le=100)
    premature_concession: bool
    concessions: list[str]
    value_negotiation_signals: list[str]
    feedback: str
