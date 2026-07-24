"""HTTP visibility for MVP voice quota usage."""

from fastapi import APIRouter, Query

from .voice_quota import voice_quota_service


router = APIRouter(prefix="/api/v1/extensions/voice-quota", tags=["voice-quota"])


@router.get("/status")
def get_voice_quota_status(
    user_id: str = Query(default="anonymous", min_length=1, max_length=120),
    workspace_id: str = Query(default="default", min_length=1, max_length=120),
    plan: str = Query(default="free", max_length=40),
):
    return voice_quota_service.status(workspace_id, user_id, plan)
