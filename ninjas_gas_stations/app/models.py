from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol


@dataclass(slots=True)
class FuelPrice:
    fuel_id: str
    label: str
    price_eur: float
    updated_at: datetime | None


@dataclass(slots=True)
class Station:
    id: str
    name: str
    brand: str | None
    address: str | None
    municipality: str | None
    latitude: float
    longitude: float
    prices: dict[str, FuelPrice] = field(default_factory=dict)
    opening_hours: str | None = None


class FuelPriceProvider(Protocol):
    async def fetch_stations(self) -> list[Station]: ...
