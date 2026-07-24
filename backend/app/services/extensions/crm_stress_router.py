from fastapi import APIRouter, HTTPException

from app.personas import PERSONAS

from .lost_deal import LostDealAnalyzer
from .models import RecreatedSimulation, RecreateLostDealRequest
from .pre_call_context import PreCallContextBuilder
from .stress import StressBehaviorRuleset
from .simulation_registry import simulation_registry


router = APIRouter(prefix="/api/v1/simulations", tags=["simulation-extensions"])


@router.post("/recreate-lost-deal", response_model=RecreatedSimulation, status_code=201)
def recreate_lost_deal(request: RecreateLostDealRequest) -> RecreatedSimulation:
    if request.persona_id not in PERSONAS:
        raise HTTPException(status_code=422, detail="Unknown persona_id")

    context_builder = PreCallContextBuilder()
    context = context_builder.build(request.deal)
    failure = LostDealAnalyzer().analyze(request.deal)
    stress = StressBehaviorRuleset()
    bottleneck_block = (
        "\n\n<locked_bottleneck>\n"
        f"Recrie especificamente o gargalo '{failure.category}' na etapa "
        f"'{failure.stage}'. Nao alivie essa objecao sem evidencia do vendedor.\n"
        "</locked_bottleneck>"
    )
    prompt = (
        PERSONAS[request.persona_id]["prompt"]
        + context_builder.render_prompt_block(context)
        + bottleneck_block
        + stress.prompt_block(request.stress)
    )
    session_config = {
        "system_prompt_override": prompt,
        "stress": (
            request.stress.model_dump()
            if hasattr(request.stress, "model_dump")
            else request.stress.dict()
        ),
        "locked_bottleneck": failure.category,
    }
    simulation_id = simulation_registry.create(session_config)
    return RecreatedSimulation(
        simulation_id=simulation_id,
        persona_id=request.persona_id,
        locked_bottleneck=failure,
        pre_call_context=context,
        system_prompt=prompt,
        stress_level=request.stress.stress_level,
        stress_intensity=request.stress.stress_intensity,
        session_config={"simulation_id": simulation_id},
    )
