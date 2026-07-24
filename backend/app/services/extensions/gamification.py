"""Append-only ranks, weekly challenges, arenas, and weighted leaderboards."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from threading import RLock
from uuid import uuid4


class UserProficiencyRank(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    BLACK = "BLACK"


class ArenaMode(str, Enum):
    ONE_V_ONE = "1V1"
    TEAM = "TEAM"


class ChallengeStatus(str, Enum):
    OPEN = "OPEN"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


@dataclass
class WeeklyChallenge:
    name: str
    scenario_template_id: str
    difficulty: float = 1.0
    id: str = field(default_factory=lambda: str(uuid4()))
    starts_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    ends_at: datetime | None = None
    status: ChallengeStatus = ChallengeStatus.OPEN


@dataclass
class ArenaChallenge:
    challenge_id: str
    mode: ArenaMode
    participants: list[str]
    teams: dict[str, list[str]] = field(default_factory=dict)
    id: str = field(default_factory=lambda: str(uuid4()))
    status: ChallengeStatus = ChallengeStatus.OPEN


class GamificationService:
    def __init__(self):
        self._weekly: dict[str, WeeklyChallenge] = {}
        self._arenas: dict[str, ArenaChallenge] = {}
        self._scores: list[dict] = []
        self._ranks: dict[str, UserProficiencyRank] = {}
        self._lock = RLock()

    def create_weekly(self, challenge: WeeklyChallenge) -> WeeklyChallenge:
        if challenge.difficulty <= 0:
            raise ValueError("difficulty must be greater than zero")
        with self._lock:
            self._weekly[challenge.id] = challenge
        return challenge

    def create_arena(self, arena: ArenaChallenge) -> ArenaChallenge:
        if arena.mode == ArenaMode.ONE_V_ONE and len(arena.participants) != 2:
            raise ValueError("1V1 arenas require exactly two participants")
        if arena.mode == ArenaMode.TEAM and (len(arena.teams) < 2 or any(not team for team in arena.teams.values())):
            raise ValueError("team arenas require at least two non-empty teams")
        with self._lock:
            self._arenas[arena.id] = arena
        return arena

    def record_score(self, challenge_id: str, user_id: str, score: float) -> dict:
        if not 0 <= score <= 100:
            raise ValueError("score must be between 0 and 100")
        with self._lock:
            challenge = self._weekly.get(challenge_id)
            if challenge is None:
                raise KeyError(challenge_id)
            entry = {
                "challenge_id": challenge_id,
                "user_id": user_id,
                "score": score,
                "difficulty": challenge.difficulty,
                "score_weighted_by_difficulty": round(score * challenge.difficulty, 4),
            }
            self._scores.append(entry)
        return entry

    def leaderboard(self, challenge_id: str) -> list[dict]:
        with self._lock:
            entries = [dict(entry) for entry in self._scores if entry["challenge_id"] == challenge_id]
        best_by_user = {}
        for entry in entries:
            current = best_by_user.get(entry["user_id"])
            if current is None or entry["score_weighted_by_difficulty"] > current["score_weighted_by_difficulty"]:
                best_by_user[entry["user_id"]] = entry
        ranked = sorted(best_by_user.values(), key=lambda entry: entry["score_weighted_by_difficulty"], reverse=True)
        for position, entry in enumerate(ranked, 1):
            entry["position"] = position
        return ranked

    def set_rank(self, user_id: str, rank: UserProficiencyRank) -> UserProficiencyRank:
        with self._lock:
            self._ranks[user_id] = rank
        return rank
