# Contributing

## Development

Backend: from `ninjas_gas_stations/`, install `requirements-dev.txt`, then run `ruff check app tests`, `black --check app tests`, `mypy app`, and `pytest -q`.

Card: from `ninjas-gas-stations-card/`, run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`.

Keep upstream requests mocked in tests. Never add Home Assistant tokens, API tokens, or personal location traces to fixtures. Update `docs/ARCHITECTURE.md` when changing provider endpoints, authentication, cache behavior, or location data flow.
