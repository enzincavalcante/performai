"""Compose optional enterprise context before the live model connection opens."""

from app.personas import build_system_instruction

from .models import AgentPersonaConfigExtension, CRMDealPayload
from .pre_call_context import PreCallContextBuilder
from .runtime import rag_service
from .simulation_registry import simulation_registry
from .stress import StressBehaviorRuleset


class PreSessionExtensionOrchestrator:
    def build_prompt(self, persona_id: str, session_config: dict | None) -> str:
        raw = dict(session_config) if isinstance(session_config, dict) else {}
        simulation_id = raw.get("simulation_id")
        if isinstance(simulation_id, str):
            registered = simulation_registry.get(simulation_id)
            if registered:
                raw = {**registered, **raw}

        prompt_override = raw.get("system_prompt_override")
        prompt = (
            prompt_override
            if isinstance(prompt_override, str) and prompt_override.strip()
            else build_system_instruction(persona_id, raw)
        )

        crm_payload = raw.get("crm_context")
        if isinstance(crm_payload, dict) and not prompt_override:
            deal = CRMDealPayload.model_validate(crm_payload)
            builder = PreCallContextBuilder()
            prompt += builder.render_prompt_block(builder.build(deal))

        stress_payload = raw.get("stress")
        if isinstance(stress_payload, dict) and not prompt_override:
            prompt += StressBehaviorRuleset().prompt_block(
                AgentPersonaConfigExtension.model_validate(stress_payload)
            )

        if raw.get("use_top_seller_rag") is True:
            scenario = raw.get("rag_scenario") or raw.get("context") or raw.get("challenge")
            if isinstance(scenario, str) and scenario.strip():
                prompt = rag_service.augment_system_prompt(prompt, scenario[:1000], limit=3)

        return prompt


pre_session_orchestrator = PreSessionExtensionOrchestrator()
