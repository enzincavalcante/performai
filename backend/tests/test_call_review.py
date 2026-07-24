import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.extensions.call_review import CallReviewAnalyzer
from app.services.extensions import call_review_router


REPORT = {
    "overall_score": 78,
    "summary": "Boa descoberta, com fechamento pouco objetivo.",
    "strengths": ["Escuta ativa"],
    "improvements": ["Confirmar o proximo passo"],
    "critical_moments": [{
        "timestamp": "00:42",
        "speaker": "cliente",
        "quote": "Preciso pensar.",
        "issue": "Objecao nao aprofundada",
        "recommendation": "Perguntar qual risco impede a decisao.",
    }],
    "competency_scores": {"discovery": 82, "closing": 61},
    "next_actions": ["Treinar fechamento"],
    "transcript": "[00:01] Vendedor: Bom dia.",
}


def test_analyzer_uses_injected_client_and_returns_structured_report():
    client = MagicMock()
    client.models.generate_content.return_value = SimpleNamespace(text=json.dumps(REPORT), parsed=None)
    times = iter([10.0, 12.5])
    analyzer = CallReviewAnalyzer(client=client, model="test-model", clock=lambda: next(times))

    result = analyzer.analyze(b"audio", "audio/wav", {"seller_id": "seller-1"})

    assert result.status == "completed"
    assert result.processing["mode"] == "synchronous"
    assert result.processing["duration_seconds"] == 2.5
    assert result.report.overall_score == 78
    assert result.report.critical_moments[0].timestamp == "00:42"
    client.models.generate_content.assert_called_once()


def test_endpoint_accepts_audio_and_metadata():
    expected = CallReviewAnalyzer(
        client=MagicMock(),
        clock=lambda: 0,
    )
    expected.client.models.generate_content.return_value = SimpleNamespace(text=json.dumps(REPORT), parsed=None)
    with patch.object(call_review_router, "call_review_analyzer", expected):
        with TestClient(app) as client:
            response = client.post(
                "/api/v1/analytics/call-review",
                files={"audio": ("call.wav", b"valid-audio", "audio/wav")},
                data={"metadata": json.dumps({"deal_id": "d-1"})},
            )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["report"]["transcript"].startswith("[00:01]")


def test_endpoint_rejects_unsupported_format_before_analysis():
    with patch.object(call_review_router, "call_review_analyzer") as analyzer:
        with TestClient(app) as client:
            response = client.post(
                "/api/v1/analytics/call-review",
                files={"audio": ("call.txt", b"not-audio", "text/plain")},
            )

    assert response.status_code == 415
    analyzer.analyze.assert_not_called()


def test_endpoint_rejects_empty_audio():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/analytics/call-review",
            files={"audio": ("call.wav", b"", "audio/wav")},
        )
    assert response.status_code == 422


def test_endpoint_rejects_invalid_metadata():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/analytics/call-review",
            files={"audio": ("call.wav", b"audio", "audio/wav")},
            data={"metadata": "not-json"},
        )
    assert response.status_code == 422


def test_endpoint_rejects_oversized_audio():
    with patch.object(call_review_router, "MAX_AUDIO_BYTES", 4):
        with TestClient(app) as client:
            response = client.post(
                "/api/v1/analytics/call-review",
                files={"audio": ("call.wav", b"12345", "audio/wav")},
            )
    assert response.status_code == 413


def test_endpoint_maps_invalid_ai_payload_to_bad_gateway():
    analyzer = MagicMock()
    analyzer.analyze.side_effect = json.JSONDecodeError("invalid", "", 0)
    with patch.object(call_review_router, "call_review_analyzer", analyzer):
        with TestClient(app) as client:
            response = client.post(
                "/api/v1/analytics/call-review",
                files={"audio": ("call.wav", b"audio", "audio/wav")},
            )
    assert response.status_code == 502
