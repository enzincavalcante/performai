"""HTTP boundary for optional knowledge and gamification capabilities."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .gamification import ArenaChallenge, ArenaMode, GamificationService, WeeklyChallenge
from .runtime import gamification_service, knowledge_ingestor, rag_service
from .top_seller import TopSellerCall


router = APIRouter(prefix="/api/v1/extensions", tags=["enterprise-extensions"])


class KnowledgeIngestRequest(BaseModel):
    seller_id: str = Field(min_length=1)
    transcript: str = Field(min_length=1)
    call_id: str | None = None
    audio_metrics: dict[str, float] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RAGRequest(BaseModel):
    scenario: str = Field(min_length=1)
    base_prompt: str | None = None
    seller_id: str | None = None
    limit: int = Field(default=3, ge=1, le=10)


class WeeklyChallengeRequest(BaseModel):
    name: str = Field(min_length=1)
    scenario_template_id: str = Field(min_length=1)
    difficulty: float = Field(default=1.0, gt=0, le=5)
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class ScoreRequest(BaseModel):
    user_id: str = Field(min_length=1)
    score: float = Field(ge=0, le=100)


class ArenaRequest(BaseModel):
    challenge_id: str = Field(min_length=1)
    mode: ArenaMode
    participants: list[str] = Field(default_factory=list)
    teams: dict[str, list[str]] = Field(default_factory=dict)


@router.post("/top-sellers/ingest", status_code=201)
def ingest_top_seller(payload: KnowledgeIngestRequest):
    values = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    if values.pop("call_id") is None:
        values.pop("call_id", None)
    else:
        values["call_id"] = payload.call_id
    return knowledge_ingestor.ingest(TopSellerCall(**values))


@router.post("/top-sellers/retrieve")
def retrieve_top_seller_patterns(payload: RAGRequest):
    if payload.base_prompt is not None:
        return {"augmented_prompt": rag_service.augment_system_prompt(payload.base_prompt, payload.scenario, payload.limit)}
    return {"patterns": rag_service.retrieve(payload.scenario, payload.limit, payload.seller_id)}


@router.post("/weekly-challenges", status_code=201)
def create_weekly_challenge(payload: WeeklyChallengeRequest):
    values = payload.model_dump(exclude_none=True) if hasattr(payload, "model_dump") else payload.dict(exclude_none=True)
    return gamification_service.create_weekly(WeeklyChallenge(**values))


@router.post("/weekly-challenges/{challenge_id}/scores", status_code=201)
def record_challenge_score(challenge_id: str, payload: ScoreRequest):
    try:
        return gamification_service.record_score(challenge_id, payload.user_id, payload.score)
    except KeyError:
        raise HTTPException(status_code=404, detail="Weekly challenge not found")


@router.get("/weekly-challenges/{challenge_id}/leaderboard")
def get_leaderboard(challenge_id: str):
    return {"challenge_id": challenge_id, "entries": gamification_service.leaderboard(challenge_id)}


@router.post("/arenas", status_code=202)
def create_arena(payload: ArenaRequest):
    try:
        return gamification_service.create_arena(ArenaChallenge(**(payload.model_dump() if hasattr(payload, "model_dump") else payload.dict())))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
