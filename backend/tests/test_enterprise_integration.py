from fastapi.testclient import TestClient

from app.main import app
from app.services.extensions.pre_session import PreSessionExtensionOrchestrator
from app.services.extensions.runtime import knowledge_ingestor
from app.services.extensions.simulation_registry import simulation_registry
from app.services.extensions.top_seller import TopSellerCall


client = TestClient(app)


def test_enterprise_routers_are_mounted_without_changing_root():
    assert client.get("/").status_code == 200
    assert client.post("/api/v1/simulations/recreate-lost-deal", json={}).status_code != 404
    assert client.post("/api/v1/analytics/team-risk-matrix", json={"sellers": []}).status_code == 200
    assert client.post("/api/v1/extensions/top-sellers/ingest", json={}).status_code != 404


def test_lost_deal_response_hands_off_to_live_session_registry():
    response = client.post("/api/v1/simulations/recreate-lost-deal", json={
        "deal": {
            "lead_name": "Ada",
            "company": "Acme",
            "last_stage": "Proposal",
            "loss_reason": "Price objection after the proposal",
        },
        "persona_id": "budget_guardian",
        "stress": {"stress_level": "AGGRESSIVE_DISCOUNT_SEEKER", "stress_intensity": 0.8},
    })
    assert response.status_code == 201
    payload = response.json()
    assert payload["session_config"] == {"simulation_id": payload["simulation_id"]}
    registered = simulation_registry.get(payload["simulation_id"])
    assert registered is not None
    assert "locked_bottleneck" in registered["system_prompt_override"]


def test_pre_session_orchestrator_composes_crm_stress_and_rag():
    knowledge_ingestor.ingest(TopSellerCall(
        seller_id="top-1",
        transcript="Quantifique o retorno antes de discutir preco e desconto.",
    ))
    prompt = PreSessionExtensionOrchestrator().build_prompt("skeptic", {
        "segment": "SaaS",
        "crm_context": {"company": "Acme", "last_stage": "Discovery"},
        "stress": {"stress_level": "HOSTILE_EXECUTIVE", "stress_intensity": 0.7},
        "use_top_seller_rag": True,
        "rag_scenario": "cliente pede desconto sem discutir ROI",
    })
    assert "Acme" in prompt
    assert "stress_rules" in prompt
    assert "PADROES DE ALTA PERFORMANCE" in prompt
