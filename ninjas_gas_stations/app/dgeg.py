from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime
from typing import Any

import httpx

from app.models import FuelPrice, Station

logger = logging.getLogger(__name__)

# The API root and routes are read from the official DGEG website's frontend.
DGEG_API_ROOT = "https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb"
FUEL_LABELS = {
    "diesel": "Gasóleo simples",
    "gasoline95": "Gasolina simples 95",
    "dieselprime": "Gasóleo especial",
    "gasolineprime": "Gasolina premium",
    "gplauto": "GPL Auto",
}
FUEL_LABEL_GROUPS = {
    "diesel": ("Gasóleo simples",),
    "gasoline95": ("Gasolina simples 95",),
    "dieselprime": ("Gasóleo especial",),
    "gasolineprime": (
        "Gasolina 98",
        "Gasolina especial 95",
        "Gasolina especial 98",
    ),
    "gplauto": ("GPL Auto",),
}
PAGE_SIZE = 50
MAX_PAGES = 80


class DgegProvider:
    def __init__(self, api_root: str = DGEG_API_ROOT, max_pages: int = MAX_PAGES) -> None:
        self.api_root = api_root.rstrip("/")
        self.max_pages = max_pages
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(20.0),
            headers={"User-Agent": "NinjasGasStations/1.0 (Home Assistant add-on)"},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def _get_json(self, route: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                response = await self._client.get(f"{self.api_root}/{route}", params=params)
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict) or payload.get("status") is not True:
                    raise ValueError(f"DGEG {route} returned an unsuccessful response")
                return payload
            except (httpx.HTTPError, ValueError) as exc:
                last_error = exc
                if attempt < 2:
                    await asyncio.sleep(0.5 * (2**attempt))
        raise RuntimeError(
            f"DGEG request failed for {route} with params {params}: {last_error}"
        ) from last_error

    async def fetch_stations(self, fallback_stations: list[Station] | None = None) -> list[Station]:
        fuel_response = await self._get_json("GetTiposCombustiveis")
        ids_by_label: dict[str, str] = {}
        requested_labels = {label for labels in FUEL_LABEL_GROUPS.values() for label in labels}
        for item in fuel_response.get("resultado", []):
            label = str(item.get("Descritivo", "")).strip()
            if item.get("fl_ativo") and label in requested_labels:
                ids_by_label[label] = str(item["Id"])
        missing = requested_labels - ids_by_label.keys()
        if missing:
            raise RuntimeError(f"DGEG fuel types not found: {', '.join(sorted(missing))}")

        grouped: dict[str, Station] = {}
        fetched_labels: list[str] = []
        failed_labels: list[str] = []
        for label, fuel_id in ids_by_label.items():
            try:
                for page in range(1, self.max_pages + 1):
                    payload = await self._get_json(
                        "PesquisarPostos",
                        {
                            "idsTiposComb": fuel_id,
                            "idMarca": "",
                            "idTipoPosto": "",
                            "idDistrito": "",
                            "idsMunicipios": "",
                            "qtdPorPagina": PAGE_SIZE,
                            "pagina": page,
                        },
                    )
                    records = payload.get("resultado") or []
                    for record in records:
                        self._merge_record(grouped, record, ids_by_label)
                    if len(records) < PAGE_SIZE:
                        break
                    # A small inter-page pause avoids hammering the public service.
                    await asyncio.sleep(0.15)
            except RuntimeError as exc:
                failed_labels.append(label)
                logger.warning(
                    "DGEG refresh failed for fuel %s; retaining cached prices where available: %s",
                    label,
                    exc,
                )
                continue
            fetched_labels.append(label)

        if not fetched_labels:
            raise RuntimeError("DGEG refresh failed for every requested fuel type")
        if failed_labels:
            logger.warning(
                "DGEG refresh is incomplete; unavailable fuels: %s", ", ".join(failed_labels)
            )
            self._merge_fallback_prices(
                grouped,
                fallback_stations or [],
                {ids_by_label[label] for label in failed_labels},
            )
        return list(grouped.values())

    @staticmethod
    def _merge_fallback_prices(
        grouped: dict[str, Station],
        fallback_stations: list[Station],
        failed_fuel_ids: set[str],
    ) -> None:
        for fallback in fallback_stations:
            stale_prices = {
                fuel_id: price
                for fuel_id, price in fallback.prices.items()
                if fuel_id in failed_fuel_ids
            }
            if not stale_prices:
                continue
            station = grouped.get(fallback.id)
            if station is None:
                station = Station(
                    id=fallback.id,
                    name=fallback.name,
                    brand=fallback.brand,
                    address=fallback.address,
                    municipality=fallback.municipality,
                    latitude=fallback.latitude,
                    longitude=fallback.longitude,
                    opening_hours=fallback.opening_hours,
                )
                grouped[fallback.id] = station
            for fuel_id, price in stale_prices.items():
                station.prices.setdefault(fuel_id, price)

    @staticmethod
    def _merge_record(
        grouped: dict[str, Station],
        record: dict[str, Any],
        ids_by_label: dict[str, str],
    ) -> None:
        try:
            station_id = str(record["Id"])
            latitude = float(record["Latitude"])
            longitude = float(record["Longitude"])
            if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                return
            label = str(record.get("Combustivel", "")).strip()
            fuel_id = ids_by_label.get(label)
            if not fuel_id:
                return
            price_text = str(record.get("Preco", ""))
            match = re.search(r"\d+(?:[.,]\d+)?", price_text)
            if not match:
                return
            updated_at = None
            if record.get("DataAtualizacao"):
                updated_at = datetime.strptime(str(record["DataAtualizacao"]), "%Y-%m-%d %H:%M")
            station = grouped.get(station_id)
            if station is None:
                station = Station(
                    id=station_id,
                    name=str(record.get("Nome") or "Unknown station"),
                    brand=record.get("Marca"),
                    address=", ".join(
                        str(value).strip()
                        for value in (record.get("Morada"), record.get("CodPostal"))
                        if value
                    )
                    or None,
                    municipality=record.get("Municipio"),
                    latitude=latitude,
                    longitude=longitude,
                )
                grouped[station_id] = station
            station.prices[fuel_id] = FuelPrice(
                fuel_id=fuel_id,
                label=label,
                price_eur=float(match.group().replace(",", ".")),
                updated_at=updated_at,
            )
        except (KeyError, TypeError, ValueError) as exc:
            logger.debug("Skipping malformed DGEG station record: %s", exc)
