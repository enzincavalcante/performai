"""Shared extension services used by HTTP ingestion and pre-session orchestration."""

from .top_seller import TopSellerKnowledgeIngestor, TopSellerRAGService
from .vector_store import InMemoryVectorStore
from .gamification import GamificationService


vector_store = InMemoryVectorStore()
knowledge_ingestor = TopSellerKnowledgeIngestor(vector_store)
rag_service = TopSellerRAGService(vector_store)
gamification_service = GamificationService()
