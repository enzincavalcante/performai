import re

from .models import CRMDealPayload, FailurePoint


class LostDealAnalyzer:
    _CATEGORIES = (
        ("price_objection", ("preco", "price", "caro", "expensive", "desconto", "discount")),
        ("competitor", ("concorrente", "competitor", "fornecedor atual", "current vendor")),
        ("missing_value", ("roi", "valor", "value", "retorno", "business case")),
        ("timing", ("timing", "prioridade", "priority", "agora nao", "not now")),
        ("authority", ("decisor", "decision maker", "aprovacao", "approval")),
    )

    def analyze(self, deal: CRMDealPayload) -> FailurePoint:
        evidence_source = " ".join(
            filter(None, [deal.loss_reason, deal.notes, *deal.transcripts])
        )
        normalized = self._normalize(evidence_source)
        category = "unspecified_objection"
        matched = ""
        for candidate, keywords in self._CATEGORIES:
            matched = next((word for word in keywords if word in normalized), "")
            if matched:
                category = candidate
                break
        evidence = deal.loss_reason or self._sentence_with(normalized, matched) or "Motivo nao informado pelo CRM"
        confidence = 0.9 if deal.loss_reason and matched else 0.72 if matched else 0.35
        return FailurePoint(
            category=category,
            stage=deal.last_stage or "unknown",
            evidence=evidence[:500],
            confidence=confidence,
        )

    @staticmethod
    def _normalize(value: str) -> str:
        return " ".join(value.lower().split())

    @staticmethod
    def _sentence_with(text: str, keyword: str) -> str:
        if not keyword:
            return ""
        sentences = re.split(r"(?<=[.!?])\s+", text)
        return next((sentence for sentence in sentences if keyword in sentence), "")
