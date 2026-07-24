"""Upload boundary for professional call review."""

import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from .call_review import call_review_analyzer


router = APIRouter(prefix="/api/v1/analytics", tags=["call-review"])

MAX_AUDIO_BYTES = 25 * 1024 * 1024
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/m4a",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
}


@router.post("/call-review")
async def review_call(
    audio: UploadFile = File(...),
    metadata: str = Form(default="{}"),
):
    mime_type = (audio.content_type or "").lower()
    if mime_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Formato de audio nao suportado.")

    try:
        parsed_metadata = json.loads(metadata)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail="Metadados devem ser um objeto JSON valido.") from exc
    if not isinstance(parsed_metadata, dict):
        raise HTTPException(status_code=422, detail="Metadados devem ser um objeto JSON.")

    content = await audio.read(MAX_AUDIO_BYTES + 1)
    await audio.close()
    if not content:
        raise HTTPException(status_code=422, detail="O arquivo de audio esta vazio.")
    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio excede o limite de 25 MB.")

    try:
        return call_review_analyzer.analyze(content, mime_type, parsed_metadata)
    except (ValueError, ValidationError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="A IA retornou uma analise invalida.") from exc
