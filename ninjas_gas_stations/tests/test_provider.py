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

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if request.url.path.endswith("/GetTiposCombustiveis"):
            return httpx.Response(
                200,
                json={
                    "status": True,
                    "resultado": [
                        {"Id": 2101, "Descritivo": "Gasóleo simples", "fl_ativo": True},
                        {"Id": 3201, "Descritivo": "Gasolina simples 95", "fl_ativo": True},
                    ],
                },
            )
        fuel_id = request.url.params["idsTiposComb"]
        label = "Gasóleo simples" if fuel_id == "2101" else "Gasolina simples 95"
        rows = [row for row in fixture["resultado"] if row["Combustivel"] == label]
        return httpx.Response(200, json={"status": True, "resultado": rows})

    provider = DgegProvider(api_root="https://dgeg.test", max_pages=1)
    await provider.close()
    provider._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        stations = await provider.fetch_stations()
    finally:
        await provider.close()

    assert len(calls) == 3
    assert len(stations) == 1
    assert stations[0].prices["2101"].price_eur == 1.939
    assert stations[0].prices["3201"].price_eur == 1.999
