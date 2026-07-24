from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.services.extensions.gamification import (
    ArenaChallenge, ArenaMode, GamificationService, WeeklyChallenge,
)
from app.services.extensions.router import router
from app.services.extensions.top_seller import TopSellerCall, TopSellerKnowledgeIngestor, TopSellerRAGService
from app.services.extensions.vector_store import InMemoryVectorStore


def test_ingestion_and_rag_retrieve_relevant_pattern():
    store = InMemoryVectorStore()
    ingestor = TopSellerKnowledgeIngestor(store)
    rag = TopSellerRAGService(store)
    result = ingestor.ingest(TopSellerCall("seller-1", "O preço está caro. Vamos calcular o ROI e o valor gerado."))
    assert result["patterns_ingested"] == 2
    retrieved = rag.retrieve("cliente questiona preço e retorno", limit=1)
    assert retrieved and retrieved[0]["metadata"]["seller_id"] == "seller-1"


def test_weighted_leaderboard_keeps_best_attempt():
    service = GamificationService()
    challenge = service.create_weekly(WeeklyChallenge("Enterprise", "scenario-1", difficulty=1.5))
    service.record_score(challenge.id, "ana", 70)
    service.record_score(challenge.id, "ana", 80)
    service.record_score(challenge.id, "bia", 75)
    entries = service.leaderboard(challenge.id)
    assert [entry["user_id"] for entry in entries] == ["ana", "bia"]
    assert entries[0]["score_weighted_by_difficulty"] == 120


def test_arena_validates_1v1_participants():
    service = GamificationService()
    try:
        service.create_arena(ArenaChallenge("challenge", ArenaMode.ONE_V_ONE, ["only-one"]))
        assert False, "expected validation error"
    except ValueError:
        pass


def test_extension_router_end_to_end():
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)
    created = client.post("/api/v1/extensions/weekly-challenges", json={
        "name": "Semana de ROI", "scenario_template_id": "roi-1", "difficulty": 2,
    })
    assert created.status_code == 201
    challenge_id = created.json()["id"]
    score = client.post(f"/api/v1/extensions/weekly-challenges/{challenge_id}/scores", json={"user_id": "u1", "score": 90})
    assert score.status_code == 201
    leaderboard = client.get(f"/api/v1/extensions/weekly-challenges/{challenge_id}/leaderboard").json()
    assert leaderboard["entries"][0]["score_weighted_by_difficulty"] == 180


def test_team_arena_endpoint_is_async_accepted():
    app = FastAPI()
    app.include_router(router)
    response = TestClient(app).post("/api/v1/extensions/arenas", json={
        "challenge_id": "weekly-1", "mode": "TEAM", "teams": {"alpha": ["u1"], "beta": ["u2"]}
    })
    assert response.status_code == 202
    assert response.json()["mode"] == "TEAM"
