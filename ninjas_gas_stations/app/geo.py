from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_KM = 6371.0088


def within_radius_bbox(
    lat: float, lon: float, station_lat: float, station_lon: float, radius_km: float
) -> bool:
    latitude_delta = radius_km / 110.574
    longitude_delta = radius_km / (111.320 * max(abs(cos(radians(lat))), 1e-6))
    longitude_distance = abs((station_lon - lon + 180) % 360 - 180)
    return abs(station_lat - lat) <= latitude_delta and longitude_distance <= min(
        longitude_delta, 180
    )


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad, lat2_rad = radians(lat1), radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    value = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * asin(sqrt(min(1.0, value)))
