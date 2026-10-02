import json
from datetime import datetime
from pathlib import Path

from app.dgeg import DgegProvider
from app.geo import haversine_km, within_radius_bbox
from app.main import _serialize_station, _station_sort_key
from app.models import FuelPrice, Station


def test_haversine_known_distance() -> None:
    assert round(haversine_km(38.7223, -9.1393, 38.7223, -9.1393), 4) == 0
    assert 4.0 < haversine_km(38.7223, -9.1393, 38.7223, -9.08) < 5.5


def test_bounding_box_keeps_nearby_points_and_rejects_far_points() -> None:
    assert within_radius_bbox(38.72, -9.13, 38.73, -9.12, 5)
    assert not within_radius_bbox(38.72, -9.13, 40.0, -9.13, 5)


def test_dgeg_rows_are_grouped_by_station_and_fuel() -> None:
    grouped: dict[str, Station] = {}
    ids = {"Gasóleo simples": "2101", "Gasolina simples 95": "3201"}
    common = {
        "Id": 42,
        "Nome": "Example",
        "Marca": "PRIO",
        "Municipio": "Lisboa",
        "Morada": "Rua A",
        "CodPostal": "1000-001",
        "Latitude": 38.72,
        "Longitude": -9.13,
        "DataAtualizacao": "2026-10-01 08:30",
    }
    DgegProvider._merge_record(
        grouped, {**common, "Combustivel": "Gasóleo simples", "Preco": "1,549 €"}, ids
    )
    DgegProvider._merge_record(
        grouped, {**common, "Combustivel": "Gasolina simples 95", "Preco": "1,699 €"}, ids
    )

    station = grouped["42"]
    assert len(grouped) == 1
    assert set(station.prices) == {"2101", "3201"}
    assert station.prices["2101"].price_eur == 1.549
    assert station.prices["3201"].updated_at == datetime(2026, 10, 1, 8, 30)
    serialized = _serialize_station(station, 3.2)
    assert serialized["distance_km"] == 3.2
    assert "navigate=yes" in serialized["waze_url"]


def test_recorded_dgeg_fixture_matches_live_response_shape() -> None:
    fixture = Path(__file__).parent / "fixtures" / "dgeg_search.json"
    payload = json.loads(fixture.read_text(encoding="utf-8"))
    grouped: dict[str, Station] = {}
    fuel_ids = {"Gasóleo simples": "2101", "Gasolina simples 95": "3201"}
    for record in payload["resultado"]:
        DgegProvider._merge_record(grouped, record, fuel_ids)
    station = grouped["67360"]
    assert station.prices["2101"].price_eur == 1.939
    assert station.prices["3201"].price_eur == 1.999


def test_sort_key_prioritizes_price_then_distance() -> None:
    station = Station(
        id="1",
        name="A",
        brand=None,
        address=None,
        municipality=None,
        latitude=38,
        longitude=-9,
        prices={"2101": FuelPrice("2101", "Gasóleo simples", 1.5, None)},
    )
    assert _station_sort_key(station, "diesel", 4.0) == (1.5, 4.0)
    assert _station_sort_key(station, "distance", 4.0) == (4.0, 0)
