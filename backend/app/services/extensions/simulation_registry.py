"""Short-lived handoff between HTTP simulation creation and the live socket."""

from copy import deepcopy
from threading import RLock
from time import monotonic
from uuid import uuid4


class SimulationRegistry:
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, tuple[float, dict]] = {}
        self._lock = RLock()

    def create(self, config: dict) -> str:
        simulation_id = str(uuid4())
        with self._lock:
            self._prune()
            self._items[simulation_id] = (monotonic() + self.ttl_seconds, deepcopy(config))
        return simulation_id

    def get(self, simulation_id: str) -> dict | None:
        with self._lock:
            self._prune()
            item = self._items.get(simulation_id)
            return deepcopy(item[1]) if item else None

    def _prune(self) -> None:
        now = monotonic()
        expired = [key for key, (expires_at, _) in self._items.items() if expires_at <= now]
        for key in expired:
            self._items.pop(key, None)


simulation_registry = SimulationRegistry()
