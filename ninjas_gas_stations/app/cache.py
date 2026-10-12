from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class JsonCache:
    def __init__(self, path: Path, ttl_seconds: int) -> None:
        self.path = path
        self.ttl_seconds = ttl_seconds
        self._value: Any = None
        self._stored_at = 0.0

    def load(self) -> Any:
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
            self._stored_at = float(payload["stored_at"])
            self._value = payload["value"]
        except (OSError, ValueError, KeyError, TypeError):
            return None
        return self._value

    def get(self) -> Any:
        if self._value is not None:
            return self._value
        return self.load()

    def is_fresh(self) -> bool:
        return self._value is not None and time.time() - self._stored_at < self.ttl_seconds

    def expire(self) -> None:
        if self._value is None:
            return
        self._stored_at = 0.0
        self._write()

    def set(self, value: Any) -> None:
        self._value = value
        self._stored_at = time.time()
        self._write()

    def _write(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = self.path.with_suffix(".tmp")
        temporary_path.write_text(
            json.dumps({"stored_at": self._stored_at, "value": self._value}, ensure_ascii=False),
            encoding="utf-8",
        )
        temporary_path.replace(self.path)
