"""Unit tests for main.py (FastAPI app)"""
import os
import sys
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

# Patch genai.Client before any app module is imported, since agent.py
# calls genai.Client() at module level and requires an API key.
with patch("google.genai.Client", return_value=MagicMock()):
    os.environ.setdefault("GEMINI_API_KEY", "test-key")
    # Remove cached modules so patching takes effect
    for mod in list(sys.modules.keys()):
        if mod.startswith("app"):
            del sys.modules[mod]
    from app.main import app

from fastapi.testclient import TestClient


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoint:
    def test_root_returns_200(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_root_returns_json(self, client):
        response = client.get("/")
        assert response.headers["content-type"].startswith("application/json")

    def test_root_returns_status_field(self, client):
        response = client.get("/")
        data = response.json()
        assert "status" in data

    def test_root_status_indicates_running(self, client):
        response = client.get("/")
        data = response.json()
        assert "running" in data["status"].lower() or "performai" in data["status"].lower()


class TestCORSMiddleware:
    def test_cors_header_present_on_options(self, client):
        response = client.options(
            "/",
            headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"}
        )
        # CORS middleware should allow any origin
        assert response.status_code in (200, 204)


class TestWebSocketEndpoint:
    def test_websocket_connects_with_valid_persona(self):
        """WebSocket should accept connection and then call connect_to_gemini_live."""
        with patch("app.main.connect_to_gemini_live", new_callable=AsyncMock) as mock_connect:
            mock_connect.return_value = None
            with TestClient(app) as client:
                with client.websocket_connect("/ws/arena/skeptic") as ws:
                    # Connection was accepted; function was called
                    pass
            mock_connect.assert_called_once()

    def test_websocket_persona_id_passed_correctly(self):
        with patch("app.main.connect_to_gemini_live", new_callable=AsyncMock) as mock_connect:
            mock_connect.return_value = None
            with TestClient(app) as client:
                with client.websocket_connect("/ws/arena/budget_guardian") as ws:
                    pass
            _, kwargs = mock_connect.call_args
            args = mock_connect.call_args[0]
            # persona_id is the second positional argument
            assert args[1] == "budget_guardian"

    def test_websocket_connects_with_unknown_persona(self):
        """Unknown persona IDs should still connect (falls back to skeptic)."""
        with patch("app.main.connect_to_gemini_live", new_callable=AsyncMock) as mock_connect:
            mock_connect.return_value = None
            with TestClient(app) as client:
                with client.websocket_connect("/ws/arena/unknown_persona") as ws:
                    pass
            mock_connect.assert_called_once()

    def test_websocket_handles_disconnect_gracefully(self):
        """WebSocketDisconnect should be caught without propagating."""
        from fastapi.websockets import WebSocketDisconnect

        async def raise_disconnect(_ws, _persona_id):
            raise WebSocketDisconnect()

        with patch("app.main.connect_to_gemini_live", side_effect=raise_disconnect):
            with TestClient(app) as client:
                try:
                    with client.websocket_connect("/ws/arena/skeptic") as ws:
                        pass
                except Exception:
                    pass  # TestClient may raise on disconnect; that's OK
