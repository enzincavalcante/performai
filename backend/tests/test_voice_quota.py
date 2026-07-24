from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.extensions.voice_quota import VoiceQuotaExceeded, VoiceQuotaService


def test_quota_accounts_minutes_and_provider_tokens():
    now = [0.0]
    service = VoiceQuotaService(
        weekly_limits={"free": 2},
        clock=lambda: datetime(2026, 7, 23, tzinfo=timezone.utc),
        monotonic_clock=lambda: now[0],
    )
    lease = service.start_session("workspace-1", "seller-1")
    now[0] = 90
    status = service.finish_session(lease, input_tokens=120, output_tokens=30)

    assert status["used_minutes"] == 1.5
    assert status["remaining_minutes"] == 0.5
    assert status["sessions"] == 1
    assert status["input_tokens"] == 120
    assert status["output_tokens"] == 30


def test_quota_rejects_new_session_after_limit():
    service = VoiceQuotaService(
        weekly_limits={"free": 1},
        clock=lambda: datetime(2026, 7, 23, tzinfo=timezone.utc),
    )
    service.consume("workspace-1", "seller-1", seconds=60)

    try:
        service.start_session("workspace-1", "seller-1")
        raise AssertionError("expected quota rejection")
    except VoiceQuotaExceeded as exc:
        assert exc.status["allowed"] is False
        assert exc.status["remaining_minutes"] == 0


def test_usage_is_isolated_by_workspace_user_and_week():
    current = [datetime(2026, 7, 23, tzinfo=timezone.utc)]
    service = VoiceQuotaService(clock=lambda: current[0])
    service.consume("workspace-1", "seller-1", seconds=60)

    assert service.status("workspace-1", "seller-1")["used_minutes"] == 1
    assert service.status("workspace-1", "seller-2")["used_minutes"] == 0
    assert service.status("workspace-2", "seller-1")["used_minutes"] == 0

    current[0] = datetime(2026, 7, 30, tzinfo=timezone.utc)
    assert service.status("workspace-1", "seller-1")["used_minutes"] == 0


def test_status_endpoint_exposes_user_facing_minutes():
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/extensions/voice-quota/status",
            params={"workspace_id": "status-workspace", "user_id": "status-user", "plan": "monthly"},
        )

    assert response.status_code == 200
    assert response.json()["limit_minutes"] == 60
    assert "remaining_minutes" in response.json()


def test_websocket_rejects_when_quota_is_exhausted():
    exhausted = {
        "workspace_id": "w",
        "user_id": "u",
        "plan": "free",
        "remaining_minutes": 0,
        "allowed": False,
    }
    with patch(
        "app.main.voice_quota_service.start_session",
        side_effect=VoiceQuotaExceeded(exhausted),
    ), patch("app.main.connect_to_gemini_live", new_callable=AsyncMock) as connect:
        with TestClient(app) as client:
            with client.websocket_connect("/ws/arena/skeptic?workspace_id=w&user_id=u") as websocket:
                message = websocket.receive_json()

    assert message["code"] == "weekly_voice_quota_exceeded"
    assert message["quota"]["remaining_minutes"] == 0
    connect.assert_not_called()
