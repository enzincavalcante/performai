"""Predictive management API, mounted independently by the app factory."""

from fastapi import APIRouter, Depends

from app.services.extensions.micro_learning import (
    InMemoryMicroLearningQueue,
    NextDayMicroLearningScheduler,
)
from app.services.extensions.performance_models import TeamRiskMatrixRequest, TeamRiskMatrixResponse
from app.services.extensions.sales_performance import SalesPerformancePredictor

router = APIRouter(prefix="/api/v1/analytics", tags=["predictive-management"])
_queue = InMemoryMicroLearningQueue()
_predictor = SalesPerformancePredictor(_queue, NextDayMicroLearningScheduler())


def get_sales_performance_predictor() -> SalesPerformancePredictor:
    return _predictor


@router.post("/team-risk-matrix", response_model=TeamRiskMatrixResponse)
async def team_risk_matrix(
    request: TeamRiskMatrixRequest,
    predictor: SalesPerformancePredictor = Depends(get_sales_performance_predictor),
):
    return await predictor.build_team_risk_matrix(
        request.sellers,
        session_window=request.session_window,
        assignment_threshold=request.assignment_threshold,
    )
