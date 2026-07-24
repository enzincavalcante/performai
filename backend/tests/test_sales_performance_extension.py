import asyncio
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers.team_risk import router
from app.services.extensions.micro_learning import InMemoryMicroLearningQueue, NextDayMicroLearningScheduler
from app.services.extensions.performance_models import SellerSessions, SessionScorecard, SkillDimension
from app.services.extensions.sales_performance import SalesPerformancePredictor


def scorecard(index, score):
    return SessionScorecard(
        session_id=f"session-{index}",
        seller_id="seller-1",
        completed_at=datetime.now(timezone.utc) + timedelta(minutes=index),
        scores={SkillDimension.OBJECTION_HANDLING: score, SkillDimension.CLOSING: score + 1},
    )


def test_predictor_limits_window_and_enqueues_weak_skills():
    queue = InMemoryMicroLearningQueue()
    predictor = SalesPerformancePredictor(queue, NextDayMicroLearningScheduler())
    seller = SellerSessions(seller_id="seller-1", sessions=[scorecard(i, score) for i, score in enumerate([1, 2, 3, 4])])

    result = asyncio.run(
        predictor.build_team_risk_matrix([seller], session_window=2, assignment_threshold=6)
    )

    assert result.sellers[0].sessions_analyzed == 2
    assert result.sellers[0].skill_gaps[0].average_score == 3.5
    assert len(result.sellers[0].assignments) == 2
    assert len(queue.pending()) == 2
    assert result.sellers[0].risk_level == "high"


def test_queue_is_idempotent_for_same_daily_assignment():
    queue = InMemoryMicroLearningQueue()
    scheduler = NextDayMicroLearningScheduler()
    first = scheduler.schedule("seller-1", SkillDimension.CLOSING, "weak closing")
    second = scheduler.schedule("seller-1", SkillDimension.CLOSING, "weak closing")
    assert asyncio.run(queue.enqueue(first)) is True
    assert asyncio.run(queue.enqueue(second)) is False


def test_team_risk_matrix_endpoint_contract():
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)
    response = client.post(
        "/api/v1/analytics/team-risk-matrix",
        json={
            "sellers": [{
                "seller_id": "seller-1",
                "seller_name": "Ana",
                "sessions": [{
                    "session_id": "call-1",
                    "seller_id": "seller-1",
                    "scores": {"qualification": 4, "closing": 7},
                }],
            }],
            "session_window": 5,
            "assignment_threshold": 6,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sellers"][0]["seller_name"] == "Ana"
    assert body["sellers"][0]["assignments"][0]["skill"] == "qualification"


def test_rejects_score_outside_scale():
    app = FastAPI()
    app.include_router(router)
    response = TestClient(app).post(
        "/api/v1/analytics/team-risk-matrix",
        json={"sellers": [{"seller_id": "s", "sessions": [{
            "session_id": "x", "seller_id": "s", "scores": {"closing": 11}
        }]}]},
    )
    assert response.status_code == 422
