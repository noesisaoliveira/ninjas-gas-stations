import json
from pathlib import Path

import httpx
import pytest

from app.dgeg import DgegProvider


@pytest.mark.asyncio
async def test_provider_resolves_fuel_ids_and_reads_mocked_station_pages() -> None:
    fixture_path = Path(__file__).parent / "fixtures" / "dgeg_search.json"
    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    calls: list[httpx.Request] = []
    fuels = {
        "2101": "Gasóleo simples",
        "3201": "Gasolina simples 95",
        "2105": "Gasóleo especial",
        "3400": "Gasolina 98",
        "3205": "Gasolina especial 95",
        "3405": "Gasolina especial 98",
        "1120": "GPL Auto",
    }

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if request.url.path.endswith("/GetTiposCombustiveis"):
            return httpx.Response(
                200,
                json={
                    "status": True,
                    "resultado": [
                        {
                            "Id": int(fuel_id),
                            "Descritivo": label,
                            "fl_ativo": True,
                        }
                        for fuel_id, label in fuels.items()
                    ],
                },
            )
        fuel_id = request.url.params["idsTiposComb"]
        label = fuels[fuel_id]
        rows = [row for row in fixture["resultado"] if row["Combustivel"] == label]
        return httpx.Response(200, json={"status": True, "resultado": rows})

    provider = DgegProvider(api_root="https://dgeg.test", max_pages=1)
    await provider.close()
    provider._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        stations = await provider.fetch_stations()
    finally:
        await provider.close()

    assert len(calls) == len(fuels) + 1
    assert len(stations) == 1
    assert stations[0].prices["2101"].price_eur == 1.939
    assert stations[0].prices["3201"].price_eur == 1.999


@pytest.mark.asyncio
async def test_provider_keeps_successful_fuels_when_one_fuel_request_fails() -> None:
    fixture_path = Path(__file__).parent / "fixtures" / "dgeg_search.json"
    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    fuels = {
        "2101": "Gasóleo simples",
        "3201": "Gasolina simples 95",
        "2105": "Gasóleo especial",
        "3400": "Gasolina 98",
        "3205": "Gasolina especial 95",
        "3405": "Gasolina especial 98",
        "1120": "GPL Auto",
    }

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/GetTiposCombustiveis"):
            return httpx.Response(
                200,
                json={
                    "status": True,
                    "resultado": [
                        {"Id": int(fuel_id), "Descritivo": label, "fl_ativo": True}
                        for fuel_id, label in fuels.items()
                    ],
                },
            )
        fuel_id = request.url.params["idsTiposComb"]
        if fuel_id == "2105":
            return httpx.Response(200, json={"status": False, "resultado": []})
        label = fuels[fuel_id]
        rows = [row for row in fixture["resultado"] if row["Combustivel"] == label]
        return httpx.Response(200, json={"status": True, "resultado": rows})

    provider = DgegProvider(api_root="https://dgeg.test", max_pages=1)
    await provider.close()
    provider._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        stations = await provider.fetch_stations()
    finally:
        await provider.close()

    assert len(stations) == 1
    assert stations[0].prices["2101"].price_eur == 1.939
    assert "2105" not in stations[0].prices
