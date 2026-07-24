from .models import AgentPersonaConfigExtension, StressLevel


class StressBehaviorRuleset:
    _RULES = {
        StressLevel.NORMAL: (),
        StressLevel.AGGRESSIVE_DISCOUNT_SEEKER: (
            "Exija concessoes de preco e questione cada justificativa de valor.",
            "Interrompa pitches vagos e pressione por um numero de desconto.",
        ),
        StressLevel.COMPETITOR_LOYALIST: (
            "Defenda o fornecedor atual e exija diferenciacao quantificada.",
            "Rejeite alegacoes genericas e compare custos de troca.",
        ),
        StressLevel.HOSTILE_EXECUTIVE: (
            "Responda de forma curta, impaciente e com alta resistencia.",
            "Interrompa argumentos sem impacto financeiro quantificado.",
            "Encerre o assunto quando o vendedor evitar uma pergunta direta.",
        ),
    }

    def prompt_block(self, config: AgentPersonaConfigExtension) -> str:
        rules = self._RULES[config.stress_level]
        if not rules:
            return ""
        intensity = config.stress_intensity or 0.75
        rendered = "\n".join(f"- {rule}" for rule in rules)
        return (
            "\n\n<stress_rules>\n"
            f"Intensidade: {intensity:.2f}. Aplique estas regras sem abuso pessoal:\n"
            f"{rendered}\n</stress_rules>"
        )

    def interruption_settings(self, config: AgentPersonaConfigExtension) -> dict[str, float | bool]:
        intensity = config.stress_intensity or (0.0 if config.stress_level is StressLevel.NORMAL else 0.75)
        return {
            "enabled": config.stress_level is not StressLevel.NORMAL,
            "probability": round(min(0.85, intensity * 0.75), 2),
            "short_response_bias": round(min(1.0, 0.45 + intensity * 0.55), 2),
        }
