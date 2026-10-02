import json

from fastapi.testclient import TestClient

from app import main
from app.models import FuelPrice, Station


def test_api_requires_token_for_direct_requests(tmp_path, monkeypatch) -> None:
    class MockProvider:
        async def fetch_stations(self):
            return [
                Station(
                    id="closer",
                    name="Closer Station",
                    brand="Galp",
                    address=None,
                    municipality="Lisboa",
                    latitude=38.73,
                    longitude=-9.13,
                    prices={"2101": FuelPrice("2101", "Gasóleo simples", 1.65, None)},
                ),
                Station(
                    id="cheapest",
                    name="Cheapest Station",
                    brand="PRIO",
                    address=None,
                    municipality="Lisboa",
                    latitude=38.75,
                    longitude=-9.13,
                    prices={"2101": FuelPrice("2101", "Gasóleo simples", 1.50, None)},
                ),
                Station(
                    id="outside",
                    name="Outside Station",
                    brand="BP",
                    address=None,
                    municipality="Évora",
                    latitude=40.0,
                    longitude=-9.13,
                    prices={"2101": FuelPrice("2101", "Gasóleo simples", 1.20, None)},
                ),
            ]

        async def close(self):
            return None

    options_path = tmp_path / "options.json"
    options_path.write_text(
        json.dumps({"api_token": "test-token", "allowed_origins": ""}),
        encoding="utf-8",
    )
    monkeypatch.setattr(main, "OPTIONS_PATH", options_path)
    monkeypatch.setattr(main, "DATA_DIR", tmp_path / "data")
    monkeypatch.setattr(main, "DgegProvider", MockProvider)

    with TestClient(main.app) as client:
        assert client.get("/api/meta").status_code == 401
        assert (
            client.get(
                "/api/meta",
                headers={"X-Ingress-Path": "/api/hassio_ingress/forged"},
            ).status_code
            == 401
        )
        response = client.get("/api/meta", headers={"Authorization": "Bearer test-token"})
        stations = client.get(
            "/api/stations?lat=38.7223&lon=-9.1393&radius_km=15&sort=diesel",
            headers={"Authorization": "Bearer test-token"},
        )

    assert response.status_code == 200
    assert response.json()["fuels"]["diesel"] == "Gasóleo simples"
    assert [station["id"] for station in stations.json()["stations"]] == ["cheapest", "closer"]
    assert stations.json()["stations"][0]["prices"]["diesel"]["price_eur"] == 1.50

    with TestClient(main.app, client=("172.30.32.2", 50_000)) as ingress_client:
        ingress = ingress_client.get(
            "/api/meta",
            headers={"X-Ingress-Path": "/api/hassio_ingress/trusted"},
        )
    assert ingress.status_code == 200
