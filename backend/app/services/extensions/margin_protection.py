import re

from .models import MarginProtectionResult


class MarginProtectionEvaluator:
    _CONCESSIONS = re.compile(
        r"\b(?:dou|damos|consigo|ofereco|podemos dar)\s+(?:um\s+)?(?:desconto|\d{1,2}\s*%)|"
        r"\b(?:discount|reduce|cut)\b.{0,24}\b\d{1,2}\s*%",
        re.IGNORECASE,
    )
    _VALUE = re.compile(
        r"\b(?:roi|retorno|economia|payback|impacto|valor|resultado|volume|prazo|contrapartida)\b",
        re.IGNORECASE,
    )

    def evaluate(self, transcript: str | list[str]) -> MarginProtectionResult:
        text = "\n".join(transcript) if isinstance(transcript, list) else transcript
        concessions = [match.group(0).strip() for match in self._CONCESSIONS.finditer(text)]
        value_matches = [match.group(0).lower() for match in self._VALUE.finditer(text)]
        first_concession = self._CONCESSIONS.search(text)
        first_value = self._VALUE.search(text)
        premature = bool(first_concession and (not first_value or first_concession.start() < first_value.start()))
        score = max(0, 100 - len(concessions) * 15 - (35 if premature else 0))
        return MarginProtectionResult(
            score=score,
            premature_concession=premature,
            concessions=concessions,
            value_negotiation_signals=list(dict.fromkeys(value_matches)),
            feedback=(
                "Ancore valor e negocie contrapartidas antes de conceder desconto."
                if premature
                else "A negociacao preservou a sequencia de valor antes de concessoes."
            ),
        )
