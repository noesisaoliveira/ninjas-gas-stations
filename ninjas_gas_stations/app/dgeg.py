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
        raise RuntimeError(f"DGEG request failed for {route}") from last_error

    async def fetch_stations(self) -> list[Station]:
        fuel_response = await self._get_json("GetTiposCombustiveis")
        ids_by_label: dict[str, str] = {}
        for item in fuel_response.get("resultado", []):
            label = str(item.get("Descritivo", "")).strip()
            if item.get("fl_ativo") and label in FUEL_LABELS.values():
                ids_by_label[label] = str(item["Id"])
        missing = set(FUEL_LABELS.values()) - ids_by_label.keys()
        if missing:
            raise RuntimeError(f"DGEG fuel types not found: {', '.join(sorted(missing))}")

        grouped: dict[str, Station] = {}
        for fuel_id in ids_by_label.values():
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
        return list(grouped.values())

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
