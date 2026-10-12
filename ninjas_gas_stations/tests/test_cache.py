from app.cache import JsonCache


def test_cache_persists_values_and_expires_by_ttl(tmp_path, monkeypatch) -> None:
    current_time = [1_000.0]
    monkeypatch.setattr("app.cache.time.time", lambda: current_time[0])
    path = tmp_path / "stations.json"
    cache = JsonCache(path, ttl_seconds=60)
    value = [{"id": "station-1", "price": 1.5}]

    cache.set(value)
    reloaded = JsonCache(path, ttl_seconds=60)
    assert reloaded.get() == value
    assert reloaded.is_fresh()

    current_time[0] += 61
    assert not reloaded.is_fresh()
    assert reloaded.get() == value


def test_expire_persists_stale_status_without_dropping_cached_data(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("app.cache.time.time", lambda: 2_000.0)
    path = tmp_path / "stations.json"
    cache = JsonCache(path, ttl_seconds=60)
    value = [{"id": "station-1"}]
    cache.set(value)

    cache.expire()
    reloaded = JsonCache(path, ttl_seconds=60)

    assert reloaded.get() == value
    assert not reloaded.is_fresh()
