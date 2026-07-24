"""Unit tests for personas.py"""
import pytest
from app.personas import PERSONAS, build_system_instruction

REQUIRED_PERSONA_KEYS = {"name", "prompt"}
EXPECTED_PERSONA_IDS = {
    "skeptic",
    "budget_guardian",
    "procurement",
    "ceo",
    "aggressive_customer",
    "rude_customer",
    "price_sensitive",
    "sales_director",
    "operations_manager",
    "smb_founder",
}


class TestPersonasStructure:
    def test_personas_is_dict(self):
        assert isinstance(PERSONAS, dict)

    def test_all_expected_personas_exist(self):
        for persona_id in EXPECTED_PERSONA_IDS:
            assert persona_id in PERSONAS, f"Persona '{persona_id}' missing from PERSONAS"

    def test_no_extra_personas_without_review(self):
        """Ensure we're aware of all defined personas."""
        assert set(PERSONAS.keys()) == EXPECTED_PERSONA_IDS

    def test_each_persona_has_required_keys(self):
        for persona_id, persona in PERSONAS.items():
            for key in REQUIRED_PERSONA_KEYS:
                assert key in persona, f"Persona '{persona_id}' missing key '{key}'"

    def test_name_is_non_empty_string(self):
        for persona_id, persona in PERSONAS.items():
            assert isinstance(persona["name"], str), f"'{persona_id}' name is not a string"
            assert len(persona["name"].strip()) > 0, f"'{persona_id}' name is empty"

    def test_prompt_is_non_empty_string(self):
        for persona_id, persona in PERSONAS.items():
            assert isinstance(persona["prompt"], str), f"'{persona_id}' prompt is not a string"
            assert len(persona["prompt"].strip()) > 0, f"'{persona_id}' prompt is empty"

    def test_prompt_has_minimum_length(self):
        """Prompts should be substantive enough to drive behavior."""
        for persona_id, persona in PERSONAS.items():
            assert len(persona["prompt"]) >= 50, f"'{persona_id}' prompt is too short"


class TestSkepticPersona:
    def setup_method(self):
        self.persona = PERSONAS["skeptic"]

    def test_name_contains_skeptic(self):
        assert "skeptic" in self.persona["name"].lower() or "Skeptic" in self.persona["name"]

    def test_prompt_mentions_cto_or_technical(self):
        prompt_lower = self.persona["prompt"].lower()
        assert "cto" in prompt_lower or "technical" in prompt_lower or "proof" in prompt_lower

    def test_prompt_sets_adversarial_behavior(self):
        prompt_lower = self.persona["prompt"].lower()
        assert any(word in prompt_lower for word in ["flaw", "skeptic", "demand", "interrupt"])


class TestBudgetGuardianPersona:
    def setup_method(self):
        self.persona = PERSONAS["budget_guardian"]

    def test_name_contains_budget(self):
        assert "budget" in self.persona["name"].lower() or "Budget" in self.persona["name"]

    def test_prompt_mentions_roi_or_cost(self):
        prompt_lower = self.persona["prompt"].lower()
        assert "roi" in prompt_lower or "cost" in prompt_lower or "cfo" in prompt_lower

    def test_prompt_mentions_competitor_angle(self):
        prompt_lower = self.persona["prompt"].lower()
        assert "free" in prompt_lower or "good enough" in prompt_lower or "already have" in prompt_lower


class TestProcurementPersona:
    def setup_method(self):
        self.persona = PERSONAS["procurement"]

    def test_name_contains_procurement(self):
        assert "procurement" in self.persona["name"].lower() or "Procurement" in self.persona["name"]

    def test_prompt_mentions_price_or_cost(self):
        prompt_lower = self.persona["prompt"].lower()
        assert "price" in prompt_lower or "pricing" in prompt_lower or "expensive" in prompt_lower

    def test_prompt_sets_impatient_behavior(self):
        prompt_lower = self.persona["prompt"].lower()
        assert "impatient" in prompt_lower or "hurry" in prompt_lower or "interrupt" in prompt_lower


class TestExtendedPersonas:
    @pytest.mark.parametrize(
        ("persona_id", "expected_terms"),
        [
            ("ceo", ("business impact", "executive", "quantified")),
            ("aggressive_customer", ("pressure", "interrupt", "aggressive")),
            ("rude_customer", ("blunt", "dismissive", "challenging")),
            ("price_sensitive", ("price", "discount", "cheaper")),
            ("sales_director", ("metas", "conversao", "pipeline")),
            ("operations_manager", ("operacoes", "implantacao", "rotina")),
            ("smb_founder", ("fundador", "caixa", "retorno")),
        ],
    )
    def test_prompt_defines_expected_behavior(self, persona_id, expected_terms):
        prompt_lower = PERSONAS[persona_id]["prompt"].lower()
        assert any(term in prompt_lower for term in expected_terms)

    def test_rude_customer_has_explicit_safety_boundaries(self):
        prompt_lower = PERSONAS["rude_customer"]["prompt"].lower()
        assert "hate speech" in prompt_lower
        assert "discriminatory" in prompt_lower
        assert "threats" in prompt_lower

    def test_rude_customer_is_challenging_without_personal_abuse(self):
        prompt_lower = PERSONAS["rude_customer"]["prompt"].lower()
        assert "objective questions" in prompt_lower
        assert "react directly" in prompt_lower
        assert "do not insult" in prompt_lower
        assert "interrupt only occasionally" in prompt_lower


class TestVoiceConversationRules:
    @pytest.mark.parametrize("persona_id", EXPECTED_PERSONA_IDS)
    def test_every_persona_uses_natural_short_pt_br_turns(self, persona_id):
        prompt_lower = build_system_instruction(persona_id).lower()
        assert "brazilian portuguese" in prompt_lower
        assert "one or two short sentences" in prompt_lower
        assert "one objective question" in prompt_lower
        assert "never give speeches or long monologues" in prompt_lower
        assert "interruptions moderately" in prompt_lower

    def test_context_does_not_remove_conversation_rules(self):
        prompt_lower = build_system_instruction(
            "rude_customer", {"challenge": "O cliente acha o preco alto."}
        ).lower()
        assert "brazilian portuguese" in prompt_lower
        assert "cenario ou desafio" in prompt_lower


class TestNewBuyerRoles:
    @pytest.mark.parametrize(
        ("persona_id", "distinct_focus"),
        [
            ("sales_director", ("conversao", "ciclo de vendas", "pipeline")),
            ("operations_manager", ("implantacao", "integracoes", "confiabilidade")),
            ("smb_founder", ("prova pratica", "retorno rapido", "caixa")),
        ],
    )
    def test_persona_has_distinct_business_focus(self, persona_id, distinct_focus):
        prompt_lower = PERSONAS[persona_id]["prompt"].lower()
        assert all(term in prompt_lower for term in distinct_focus)

    @pytest.mark.parametrize("persona_id", ["sales_director", "operations_manager", "smb_founder"])
    def test_persona_avoids_repeating_resolved_objections(self, persona_id):
        prompt_lower = PERSONAS[persona_id]["prompt"].lower()
        assert "nao repita" in prompt_lower or "sem repetir" in prompt_lower
