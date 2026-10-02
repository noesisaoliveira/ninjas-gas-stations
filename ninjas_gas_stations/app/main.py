from __future__ import annotations

import asyncio
import ipaddress
import json
import logging
import os
import secrets
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.cache import JsonCache
from app.dgeg import FUEL_LABELS, DgegProvider
from app.geo import haversine_km, within_radius_bbox
from app.models import FuelPrice, Station

DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))
OPTIONS_PATH = Path(os.getenv("OPTIONS_FILE", "/data/options.json"))


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
            },
            ensure_ascii=False,
        )


logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
for log_handler in logging.getLogger().handlers:
    log_handler.setFormatter(JsonLogFormatter())
logger = logging.getLogger("ninjas_gas_stations")


def _load_options() -> dict[str, Any]:
    try:
        payload = json.loads(OPTIONS_PATH.read_text(encoding="utf-8"))
        return cast(dict[str, Any], payload) if isinstance(payload, dict) else {}
    except (OSError, ValueError):
        return {}


def _serialize_station(station: Station, distance_km: float) -> dict[str, Any]:
    prices = {
        fuel_key: {
            "label": price.label,
            "price_eur": price.price_eur,
            "updated_at": price.updated_at.isoformat() if price.updated_at else None,
        }
        for key, price in station.prices.items()
        for fuel_key, label in FUEL_LABELS.items()
        if label == price.label
    }
    return {
        "id": station.id,
        "name": station.name,
        "brand": station.brand,
        "address": station.address,
        "municipality": station.municipality,
        "lat": station.latitude,
        "lon": station.longitude,
        "distance_km": round(distance_km, 2),
        "prices": prices,
        "opening_hours": station.opening_hours,
        "waze_url": f"https://waze.com/ul?ll={station.latitude},{station.longitude}&navigate=yes",
        "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={station.latitude},{station.longitude}",
        "apple_maps_url": f"https://maps.apple.com/?daddr={station.latitude},{station.longitude}",
    }


def _station_from_json(item: dict[str, Any]) -> Station:
    prices = {
        key: FuelPrice(
            fuel_id=key,
            label=value["label"],
            price_eur=value["price_eur"],
            updated_at=datetime.fromisoformat(value["updated_at"]) if value["updated_at"] else None,
        )
        for key, value in item["prices"].items()
    }
    return Station(
        id=item["id"],
        name=item["name"],
        brand=item["brand"],
        address=item["address"],
        municipality=item["municipality"],
        latitude=item["latitude"],
        longitude=item["longitude"],
        prices=prices,
        opening_hours=item.get("opening_hours"),
    )


def _station_to_json(station: Station) -> dict[str, Any]:
    return {
        "id": station.id,
        "name": station.name,
        "brand": station.brand,
        "address": station.address,
        "municipality": station.municipality,
        "latitude": station.latitude,
        "longitude": station.longitude,
        "opening_hours": station.opening_hours,
        "prices": {
            key: {
                "label": price.label,
                "price_eur": price.price_eur,
                "updated_at": price.updated_at.isoformat() if price.updated_at else None,
            }
            for key, price in station.prices.items()
        },
    }


def _station_sort_key(station: Station, sort: str, distance: float) -> tuple[float, float]:
    if sort == "distance":
        return (distance, 0)
    fuel_key = "gasoline95" if sort == "gasoline95" else "diesel"
    fuel_label = FUEL_LABELS[fuel_key]
    price = next(
        (p.price_eur for p in station.prices.values() if p.label == fuel_label), float("inf")
    )
    return (price, distance)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    options = _load_options()
    ttl_seconds = int(options.get("cache_ttl_minutes", 60)) * 60
    provider = DgegProvider()
    cache = JsonCache(DATA_DIR / "stations.json", ttl_seconds)
    cached = cache.get()
    app.state.provider = provider
    app.state.cache = cache
    app.state.stations = [_station_from_json(item) for item in cached] if cached else []
    app.state.last_refresh = datetime.fromtimestamp(cache._stored_at, UTC) if cached else None
    app.state.refresh_lock = asyncio.Lock()
    app.state.options = options

    async def refresh_periodically() -> None:
        while True:
            if not cache.is_fresh():
                try:
                    async with app.state.refresh_lock:
                        if not cache.is_fresh():
                            stations = await provider.fetch_stations()
                            cache.set([_station_to_json(station) for station in stations])
                            app.state.stations = stations
                            app.state.last_refresh = datetime.now(UTC)
                except Exception as exc:
                    logger.warning("Scheduled DGEG refresh failed; retaining cached data: %s", exc)
            await asyncio.sleep(ttl_seconds)

    refresh_task = asyncio.create_task(refresh_periodically())
    try:
        yield
    finally:
        refresh_task.cancel()
        await asyncio.gather(refresh_task, return_exceptions=True)
        await provider.close()


app = FastAPI(title="Ninjas Gas Stations", version="0.1.0", lifespan=lifespan)
_request_times: dict[str, list[float]] = {}


def _is_trusted_ingress_request(request: Request, options: dict[str, Any]) -> bool:
    if not request.headers.get("x-ingress-path") or not request.client:
        return False
    try:
        peer = ipaddress.ip_address(request.client.host)
        return any(
            peer in ipaddress.ip_network(network, strict=False)
            for network in options.get("trusted_ingress_cidrs", ["172.30.32.2/32"])
        )
    except ValueError:
        return False


@app.middleware("http")
async def protect_api(request: Request, call_next: RequestResponseEndpoint) -> Response:
    if request.url.path.startswith("/api/") and request.method != "OPTIONS":
        options = getattr(request.app.state, "options", _load_options())
        token = str(options.get("api_token", ""))
        ingress_request = _is_trusted_ingress_request(request, options)
        authorization = request.headers.get("authorization", "")
        if not ingress_request and (
            not token or not secrets.compare_digest(authorization, f"Bearer {token}")
        ):
            return JSONResponse(
                {"detail": "A configured add-on API token is required"}, status_code=401
            )
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        recent = [stamp for stamp in _request_times.get(client_ip, []) if now - stamp < 60]
        if len(recent) >= 60:
            return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)
        recent.append(now)
        _request_times[client_ip] = recent
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in str(_load_options().get("allowed_origins", "")).split(",")
        if origin.strip()
    ],
    allow_methods=["GET"],
    allow_headers=["Content-Type", "Authorization"],
)


async def _refresh(request: Request, force: bool = False) -> None:
    cache: JsonCache = request.app.state.cache
    async with request.app.state.refresh_lock:
        if not force and cache.is_fresh():
            return
        try:
            stations = await request.app.state.provider.fetch_stations()
        except Exception as exc:
            logger.warning("DGEG refresh failed; retaining cached data: %s", exc)
            if request.app.state.stations:
                return
            raise HTTPException(
                status_code=503, detail="Fuel data is unavailable and no cache exists"
            ) from exc
        cache.set([_station_to_json(station) for station in stations])
        request.app.state.stations = stations
        request.app.state.last_refresh = datetime.now(UTC)


@app.get("/api/health")
async def health(request: Request) -> dict[str, Any]:
    stations = request.app.state.stations
    return {
        "status": "ok",
        "station_count": len(stations),
        "last_refresh": request.app.state.last_refresh,
    }


@app.get("/api/meta")
async def meta() -> dict[str, Any]:
    return {
        "provider": "DGEG Portugal",
        "fuels": FUEL_LABELS,
        "currency": "EUR",
        "volume_unit": "l",
    }


@app.get("/api/stations")
async def get_stations(
    request: Request,
    lat: float = Query(ge=-90, le=90),
    lon: float = Query(ge=-180, le=180),
    radius_km: float | None = Query(default=None, gt=0, le=500),
    limit: int | None = Query(default=None, ge=1, le=50),
    fuels: str | None = None,
    sort: str = Query(default="diesel", pattern="^(diesel|gasoline95|distance)$"),
) -> JSONResponse:
    await _refresh(request)
    options = request.app.state.options
    radius_km = radius_km or float(options.get("default_radius_km", 15))
    limit = limit or int(options.get("default_limit", 5))
    fuels = fuels or "diesel,gasoline95"
    requested = {value.strip() for value in fuels.split(",") if value.strip()}
    invalid = requested - FUEL_LABELS.keys()
    if invalid:
        raise HTTPException(
            status_code=422, detail=f"Unsupported fuels: {', '.join(sorted(invalid))}"
        )
    matches: list[tuple[Station, float]] = []
    for station in request.app.state.stations:
        include = {str(value).casefold() for value in options.get("brands_include", [])}
        exclude = {str(value).casefold() for value in options.get("brands_exclude", [])}
        brand = (station.brand or "").casefold()
        if include and not any(value in brand for value in include):
            continue
        if exclude and any(value in brand for value in exclude):
            continue
        present_fuels = {
            "diesel" if p.label == FUEL_LABELS["diesel"] else "gasoline95"
            for p in station.prices.values()
        }
        if requested and not requested.intersection(present_fuels):
            continue
        if not within_radius_bbox(lat, lon, station.latitude, station.longitude, radius_km):
            continue
        distance = haversine_km(lat, lon, station.latitude, station.longitude)
        if distance <= radius_km:
            matches.append((station, distance))
    matches.sort(key=lambda item: _station_sort_key(item[0], sort, item[1]))
    result = [_serialize_station(station, distance) for station, distance in matches[:limit]]
    stale = request.app.state.cache.get() is not None and not request.app.state.cache.is_fresh()
    return JSONResponse(
        {
            "stations": result,
            "count": len(result),
            "radius_km": radius_km,
            "sort": sort,
            "stale": stale,
            "last_refresh": (
                request.app.state.last_refresh.isoformat()
                if request.app.state.last_refresh
                else None
            ),
        }
    )
