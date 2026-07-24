"""Weekly voice-session quota accounting for the MVP runtime.

The store is intentionally process-local. The public API speaks in minutes while
seconds and optional provider token counts are retained internally.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from threading import RLock
from time import monotonic
from uuid import uuid4


DEFAULT_WEEKLY_LIMITS = {
    "free": 3.0,
    "monthly": 60.0,
    "quarterly": 60.0,
    "annual": 60.0,
    "enterprise": 600.0,
}


def _week_key(at: datetime) -> str:
    year, week, _ = at.isocalendar()
    return f"{year}-W{week:02d}"


@dataclass(frozen=True)
class VoiceQuotaLease:
    lease_id: str
    workspace_id: str
    user_id: str
    plan: str
    week: str
    started_monotonic: float


@dataclass
class _Usage:
    seconds: float = 0.0
    input_tokens: int = 0
    output_tokens: int = 0
    sessions: int = 0


class VoiceQuotaExceeded(Exception):
    def __init__(self, status: dict):
        super().__init__("weekly voice quota exceeded")
        self.status = status


class VoiceQuotaService:
    """Thread-safe, dependency-free quota service suitable for a single MVP worker."""

    def __init__(self, weekly_limits=None, clock=None, monotonic_clock=None):
        self.weekly_limits = dict(DEFAULT_WEEKLY_LIMITS)
        if weekly_limits:
            self.weekly_limits.update(weekly_limits)
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        self._monotonic = monotonic_clock or monotonic
        self._usage: dict[tuple[str, str, str], _Usage] = {}
        self._active: dict[str, VoiceQuotaLease] = {}
        self._lock = RLock()

    def status(self, workspace_id: str, user_id: str, plan: str = "free") -> dict:
        plan = plan if plan in self.weekly_limits else "free"
        week = _week_key(self._clock())
        key = (workspace_id, user_id, week)
        with self._lock:
            usage = self._usage.get(key, _Usage())
            used_minutes = usage.seconds / 60
            limit_minutes = float(self.weekly_limits[plan])
            active_sessions = sum(
                lease.workspace_id == workspace_id
                and lease.user_id == user_id
                and lease.week == week
                for lease in self._active.values()
            )
            return {
                "workspace_id": workspace_id,
                "user_id": user_id,
                "plan": plan,
                "week": week,
                "limit_minutes": limit_minutes,
                "used_minutes": round(used_minutes, 2),
                "remaining_minutes": round(max(0.0, limit_minutes - used_minutes), 2),
                "sessions": usage.sessions,
                "active_sessions": active_sessions,
                "input_tokens": usage.input_tokens,
                "output_tokens": usage.output_tokens,
                "allowed": used_minutes < limit_minutes,
            }

    def start_session(self, workspace_id: str, user_id: str, plan: str = "free") -> VoiceQuotaLease:
        with self._lock:
            current = self.status(workspace_id, user_id, plan)
            if not current["allowed"]:
                raise VoiceQuotaExceeded(current)
            lease = VoiceQuotaLease(
                lease_id=uuid4().hex,
                workspace_id=workspace_id,
                user_id=user_id,
                plan=current["plan"],
                week=current["week"],
                started_monotonic=self._monotonic(),
            )
            self._active[lease.lease_id] = lease
            return lease

    def finish_session(
        self,
        lease: VoiceQuotaLease,
        *,
        input_tokens: int = 0,
        output_tokens: int = 0,
    ) -> dict:
        elapsed = max(0.0, self._monotonic() - lease.started_monotonic)
        with self._lock:
            active = self._active.pop(lease.lease_id, None)
            if active is None:
                return self.status(lease.workspace_id, lease.user_id, lease.plan)
            self.consume(
                lease.workspace_id,
                lease.user_id,
                seconds=elapsed,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                completed_session=True,
                at_week=lease.week,
            )
            return self.status(lease.workspace_id, lease.user_id, lease.plan)

    def consume(
        self,
        workspace_id: str,
        user_id: str,
        *,
        seconds: float,
        input_tokens: int = 0,
        output_tokens: int = 0,
        completed_session: bool = False,
        at_week: str | None = None,
    ) -> None:
        week = at_week or _week_key(self._clock())
        key = (workspace_id, user_id, week)
        with self._lock:
            usage = self._usage.setdefault(key, _Usage())
            usage.seconds += max(0.0, float(seconds))
            usage.input_tokens += max(0, int(input_tokens))
            usage.output_tokens += max(0, int(output_tokens))
            usage.sessions += int(completed_session)


voice_quota_service = VoiceQuotaService()
