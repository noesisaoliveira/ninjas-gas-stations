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
                    prices={
                        "2101": FuelPrice("2101", "Gasóleo simples", 1.65, None),
                        "2105": FuelPrice("2105", "Gasóleo especial", 1.90, None),
                        "3400": FuelPrice("3400", "Gasolina 98", 1.86, None),
                        "3205": FuelPrice("3205", "Gasolina especial 95", 1.79, None),
                        "3405": FuelPrice("3405", "Gasolina especial 98", 1.95, None),
                        "1120": FuelPrice("1120", "GPL Auto", 0.94, None),
                    },
                ),
                Station(
                    id="cheapest",
                    name="Cheapest Station",
                    brand="PRIO",
                    address=None,
                    municipality="Lisboa",
                    latitude=38.75,
                    longitude=-9.13,
                    prices={
                        "2101": FuelPrice("2101", "Gasóleo simples", 1.50, None),
                        "2105": FuelPrice("2105", "Gasóleo especial", 1.80, None),
                        "3400": FuelPrice("3400", "Gasolina 98", 1.60, None),
                        "3205": FuelPrice("3205", "Gasolina especial 95", 1.70, None),
                        "3405": FuelPrice("3405", "Gasolina especial 98", 1.80, None),
                        "1120": FuelPrice("1120", "GPL Auto", 0.89, None),
                    },
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
        json.dumps({"api_token": "päss-token", "allowed_origins": ""}),
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
        response = client.get("/api/meta", headers={"Authorization": b"Bearer p\xe4ss-token"})
        stations = client.get(
            "/api/stations?lat=38.7223&lon=-9.1393&radius_km=15&sort=diesel",
            headers={"Authorization": b"Bearer p\xe4ss-token"},
        )
        prime_stations = client.get(
            "/api/stations?lat=38.7223&lon=-9.1393&radius_km=15&fuels=gasolineprime&sort=gasolineprime",
            headers={"Authorization": b"Bearer p\xe4ss-token"},
        )
        diesel_prime_stations = client.get(
            "/api/stations?lat=38.7223&lon=-9.1393&radius_km=15&fuels=dieselprime&sort=dieselprime",
            headers={"Authorization": b"Bearer p\xe4ss-token"},
        )
        gpl_stations = client.get(
            "/api/stations?lat=38.7223&lon=-9.1393&radius_km=15&fuels=gplauto&sort=gplauto",
            headers={"Authorization": b"Bearer p\xe4ss-token"},
        )

    assert response.status_code == 200
    assert response.json()["fuels"]["diesel"] == "Gasóleo simples"
    assert [station["id"] for station in stations.json()["stations"]] == ["cheapest", "closer"]
    assert stations.json()["stations"][0]["prices"]["diesel"]["price_eur"] == 1.50
    assert [station["id"] for station in prime_stations.json()["stations"]] == [
        "cheapest",
        "closer",
    ]
    assert prime_stations.json()["stations"][0]["prices"]["gasolineprime"]["label"] == "Gasolina 98"
    assert diesel_prime_stations.json()["stations"][0]["prices"]["dieselprime"]["price_eur"] == 1.80
    assert [station["id"] for station in gpl_stations.json()["stations"]] == [
        "cheapest",
        "closer",
    ]
    assert gpl_stations.json()["stations"][0]["prices"]["gplauto"]["price_eur"] == 0.89

    with TestClient(main.app, client=("172.30.32.2", 50_000)) as ingress_client:
        ingress = ingress_client.get(
            "/api/meta",
            headers={"X-Ingress-Path": "/api/hassio_ingress/trusted"},
        )
    assert ingress.status_code == 200
