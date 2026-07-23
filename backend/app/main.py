from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.agent import connect_to_gemini_live

app = FastAPI(title="PerformAI Backend")

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
    try:
        await connect_to_gemini_live(websocket, persona_id)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for persona {persona_id}")
    except Exception as e:
        print(f"Error in websocket connection: {e}")
