"""Small vector-store boundary with a deterministic development implementation."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
import hashlib
import math
import re
from threading import RLock
from typing import Any, Iterable


@dataclass(frozen=True)
class VectorDocument:
    id: str
    text: str
    embedding: tuple[float, ...]
    metadata: dict[str, Any]


@dataclass(frozen=True)
class VectorSearchResult:
    document: VectorDocument
    score: float


class VectorStore(ABC):
    """Port implemented later by pgvector, Pinecone, or another vector DB."""

    @abstractmethod
    def upsert(self, documents: Iterable[VectorDocument]) -> int: ...

    @abstractmethod
    def search(
        self, embedding: tuple[float, ...], limit: int = 5, filters: dict[str, Any] | None = None
    ) -> list[VectorSearchResult]: ...


class HashingTextEmbedder:
    """Dependency-free feature hashing suitable for local MVP retrieval."""

    def __init__(self, dimensions: int = 128):
        self.dimensions = dimensions

    def embed(self, text: str) -> tuple[float, ...]:
        values = [0.0] * self.dimensions
        for token in re.findall(r"[\wÀ-ÿ]+", text.lower()):
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
            index = int.from_bytes(digest, "big") % self.dimensions
            values[index] += -1.0 if digest[0] & 1 else 1.0
        norm = math.sqrt(sum(value * value for value in values)) or 1.0
        return tuple(value / norm for value in values)


class InMemoryVectorStore(VectorStore):
    def __init__(self):
        self._documents: dict[str, VectorDocument] = {}
        self._lock = RLock()

    def upsert(self, documents: Iterable[VectorDocument]) -> int:
        documents = list(documents)
        with self._lock:
            self._documents.update({document.id: document for document in documents})
        return len(documents)

    def search(
        self, embedding: tuple[float, ...], limit: int = 5, filters: dict[str, Any] | None = None
    ) -> list[VectorSearchResult]:
        if limit < 1:
            return []
        with self._lock:
            documents = list(self._documents.values())
        if filters:
            documents = [
                document for document in documents
                if all(document.metadata.get(key) == value for key, value in filters.items())
            ]
        results = [
            VectorSearchResult(document, sum(a * b for a, b in zip(embedding, document.embedding)))
            for document in documents
        ]
        return sorted(results, key=lambda result: result.score, reverse=True)[:limit]
