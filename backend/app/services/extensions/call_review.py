"""Professional analysis of uploaded real sales calls."""

from __future__ import annotations

import json
import os
import re
from time import perf_counter
from typing import Any
from uuid import uuid4

from google import genai
from google.genai import types
from pydantic import BaseModel, Field


class CriticalMoment(BaseModel):
    timestamp: str = Field(min_length=1)
    speaker: str = Field(min_length=1)
    quote: str = Field(min_length=1)
    issue: str = Field(min_length=1)
    recommendation: str = Field(min_length=1)


class CallReviewReport(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    summary: str = Field(min_length=1)
    strengths: list[str]
    improvements: list[str]
    critical_moments: list[CriticalMoment]
    competency_scores: dict[str, float]
    next_actions: list[str]
    transcript: str


class CallReviewResult(BaseModel):
    request_id: str
    status: str
    processing: dict[str, Any]
    report: CallReviewReport


class CallReviewAnalyzer:
    """Analyze audio with Gemini while remaining easy to replace or mock."""

    def __init__(self, client=None, model: str | None = None, clock=None):
        self.client = client
        self.model = model or os.environ.get("GEMINI_CALL_REVIEW_MODEL", "gemini-2.5-flash")
        self._clock = clock or perf_counter

    def analyze(self, audio: bytes, mime_type: str, metadata: dict[str, Any]) -> CallReviewResult:
        started = self._clock()
        client = self.client or genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        prompt = self._build_prompt(metadata)
        response = client.models.generate_content(
            model=self.model,
            contents=[
                types.Part.from_bytes(data=audio, mime_type=mime_type),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CallReviewReport,
                temperature=0.2,
            ),
        )
        report = self._parse_report(response)
        elapsed = max(0.0, self._clock() - started)
        return CallReviewResult(
            request_id=uuid4().hex,
            status="completed",
            processing={
                "mode": "synchronous",
                "duration_seconds": round(elapsed, 3),
                "model": self.model,
            },
            report=report,
        )

    @staticmethod
    def _build_prompt(metadata: dict[str, Any]) -> str:
        safe_metadata = json.dumps(metadata, ensure_ascii=False)[:6000]
        return (
            "Atue como um diretor de vendas B2B experiente e analise esta ligacao "
            "comercial real em portugues brasileiro. Considere o papel informado "
            "(SDR, closer ou outro) e o tipo de call para aplicar uma regua justa. "
            "Gere transcricao fiel com identificacao de falantes quando possivel. "
            "Avalie separadamente: abertura e rapport; pitch e clareza da proposta; "
            "descoberta e qualidade das perguntas; qualificacao; escuta ativa e uso "
            "das observacoes do cliente; postura, seguranca e objetividade do vendedor; "
            "dominio do produto ou servico; esclarecimento de duvidas; tratamento de "
            "objecoes; construcao de valor; negociacao e protecao de margem; fechamento; "
            "definicao de proximo passo. Para SDR, valorize qualificacao e passagem de "
            "bastao. Para closer, valorize valor, objecoes, negociacao e compromisso. "
            "Em critical_moments, registre os principais acertos e falhas com timestamp, "
            "falante, citacao curta, diagnostico e recomendacao praticavel. Aponte "
            "perguntas importantes que nao foram feitas e sinais do cliente ignorados. "
            "Nao invente falas nem timestamps; quando houver incerteza, seja conservador. "
            "As notas devem estar entre 0 e 100 e precisam ser justificadas pela call. "
            f"Metadados da ligacao: {safe_metadata}"
        )

    @staticmethod
    def _parse_report(response) -> CallReviewReport:
        parsed = getattr(response, "parsed", None)
        if isinstance(parsed, CallReviewReport):
            return parsed
        if isinstance(parsed, dict):
            return CallReviewReport.model_validate(parsed)
        text = getattr(response, "text", "") or ""
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
        return CallReviewReport.model_validate(json.loads(text))


call_review_analyzer = CallReviewAnalyzer()
