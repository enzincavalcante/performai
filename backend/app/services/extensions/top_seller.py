"""Top-performer knowledge ingestion and pre-session RAG retrieval."""

from __future__ import annotations

from dataclasses import dataclass, field
import re
from typing import Any
from uuid import uuid4

from .vector_store import HashingTextEmbedder, VectorDocument, VectorStore


@dataclass(frozen=True)
class TopSellerCall:
    seller_id: str
    transcript: str
    call_id: str = field(default_factory=lambda: str(uuid4()))
    audio_metrics: dict[str, float] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)


class TopSellerKnowledgeIngestor:
    def __init__(self, vector_store: VectorStore, embedder: HashingTextEmbedder | None = None):
        self.vector_store = vector_store
        self.embedder = embedder or HashingTextEmbedder()

    def ingest(self, call: TopSellerCall) -> dict[str, Any]:
        chunks = self._extract_patterns(call.transcript)
        documents = []
        for index, (pattern_type, text) in enumerate(chunks):
            documents.append(VectorDocument(
                id=f"{call.call_id}:{index}",
                text=text,
                embedding=self.embedder.embed(text),
                metadata={
                    **call.metadata,
                    "seller_id": call.seller_id,
                    "call_id": call.call_id,
                    "pattern_type": pattern_type,
                    "audio_metrics": dict(call.audio_metrics),
                },
            ))
        return {"call_id": call.call_id, "patterns_ingested": self.vector_store.upsert(documents)}

    @staticmethod
    def _extract_patterns(transcript: str) -> list[tuple[str, str]]:
        sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n+", transcript) if part.strip()]
        patterns = []
        for sentence in sentences:
            lowered = sentence.lower()
            if any(term in lowered for term in ("preço", "caro", "desconto", "objeção", "concorrente")):
                kind = "objection_handling"
            elif any(term in lowered for term in ("valor", "resultado", "roi", "econom", "receita")):
                kind = "value_proposition"
            else:
                kind = "linguistic_cadence"
            patterns.append((kind, sentence))
        return patterns


class TopSellerRAGService:
    def __init__(self, vector_store: VectorStore, embedder: HashingTextEmbedder | None = None):
        self.vector_store = vector_store
        self.embedder = embedder or HashingTextEmbedder()

    def retrieve(self, scenario: str, limit: int = 3, seller_id: str | None = None) -> list[dict[str, Any]]:
        filters = {"seller_id": seller_id} if seller_id else None
        return [
            {"text": result.document.text, "score": round(result.score, 6), "metadata": result.document.metadata}
            for result in self.vector_store.search(self.embedder.embed(scenario), limit, filters)
        ]

    def augment_system_prompt(self, base_prompt: str, scenario: str, limit: int = 3) -> str:
        patterns = self.retrieve(scenario, limit)
        if not patterns:
            return base_prompt
        examples = "\n".join(f"- {pattern['text']}" for pattern in patterns)
        return f"{base_prompt}\n\nPADROES DE ALTA PERFORMANCE (use como referencia, sem citar a fonte):\n{examples}"
