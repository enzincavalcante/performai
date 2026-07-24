from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.agent import connect_to_gemini_live
from app.personas import PERSONAS
from app.routers.team_risk import router as team_risk_router
from app.services.extensions.crm_stress_router import router as crm_stress_router
from app.services.extensions.router import router as extensions_router
from app.services.extensions.quota_router import router as quota_router
from app.services.extensions.call_review_router import router as call_review_router
from app.services.extensions.voice_quota import VoiceQuotaExceeded, voice_quota_service

app = FastAPI(title="PerformAI Backend")
app.include_router(crm_stress_router)
app.include_router(extensions_router)
app.include_router(team_risk_router)
app.include_router(quota_router)
app.include_router(call_review_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "PerformAI Backend is running"}

@app.websocket("/ws/arena/{persona_id}")
async def arena_endpoint(websocket: WebSocket, persona_id: str):
    await websocket.accept()
    if persona_id not in PERSONAS:
        await websocket.send_json({
            "type": "error",
            "code": "invalid_persona",
            "message": "Perfil de comprador invalido.",
        })
        await websocket.close(code=1008)
        return
    user_id = websocket.query_params.get("user_id", "anonymous")[:120] or "anonymous"
    workspace_id = websocket.query_params.get("workspace_id", "default")[:120] or "default"
    plan = websocket.query_params.get("plan", "free")[:40] or "free"
    try:
        quota_lease = voice_quota_service.start_session(workspace_id, user_id, plan)
    except VoiceQuotaExceeded as exc:
        await websocket.send_json({
            "type": "error",
            "code": "weekly_voice_quota_exceeded",
            "message": "Sua cota semanal de treino por voz foi atingida.",
            "quota": exc.status,
        })
        await websocket.close(code=1008)
        return
    try:
        await connect_to_gemini_live(websocket, persona_id)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for persona {persona_id}")
    except Exception as e:
        print(f"Error in websocket connection: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "code": "arena_error",
                "message": "Nao foi possivel iniciar o coach de IA.",
            })
        except (RuntimeError, WebSocketDisconnect):
            pass
        try:
            await websocket.close(code=1011)
        except RuntimeError:
            pass
    finally:
        voice_quota_service.finish_session(quota_lease)
