# Architecture

## Components

`ninjas_gas_stations/` is a Home Assistant add-on containing a FastAPI service and a provider interface. `DgegProvider` resolves fuel IDs by their official Portuguese labels, retrieves paginated records, and normalizes them into stations and prices. The backend persists its indexed snapshot in `/data/stations.json`, applies radius and brand filters locally, then ranks matches. Haversine distance is calculated only for the cached station set, avoiding an external geocoding dependency.

`ninjas-gas-stations-card/` is a TypeScript/Lit Lovelace custom card. It obtains coordinates from a configured `device_tracker` or `person`, with browser geolocation as a fallback, and requests nearby results from the add-on API. It uses HA theme variables and does not send location to any service other than the configured API.

## DGEG Contract

The implementation was verified against the official DGEG website frontend and live JSON endpoints on 2026-10-02:

- API root: `https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb`
- Lookups: `GetTiposCombustiveis`, `GetMarcas`, `GetDistritos`, `GetMunicipios`
- Search: `PesquisarPostos` with `idsTiposComb`, `idMarca`, `idTipoPosto`, `idDistrito`, `idsMunicipios`, `qtdPorPagina`, and `pagina`
- Search rows include `Id`, `Nome`, `Marca`, `Municipio`, `Morada`, `CodPostal`, `Combustivel`, `Preco`, `DataAtualizacao`, `Latitude`, and `Longitude`.
- `GetTiposCombustiveis` currently reports Gasóleo simples as ID `2101` and Gasolina simples 95 as ID `3201`. Runtime code looks these up by label and does not depend on those IDs.

The official website states that the information is free to use but prohibits commercial use. Review the current DGEG terms before distributing or operating this project commercially.

DGEG exposes administrative filters, not a coordinate/radius filter. The add-on pages station records for each required fuel and performs geospatial filtering locally. The per-page delay and hourly cache reduce upstream traffic. A refresh may take time on an empty cache; cached station data remains available if an upstream refresh fails.

## Cache and Availability

The station snapshot is written atomically to `/data/stations.json`, with a configurable TTL (default 60 minutes). A background task refreshes on the TTL, while API reads can trigger a refresh if an expired snapshot is encountered. Failed upstream refreshes retain existing in-memory and on-disk data. Coordinates missing or invalid in DGEG data are skipped; no reverse geocoding is attempted because the source already includes coordinates for searchable records and geocoding would add an unneeded third-party data flow.

## Home Assistant Access and Security

The add-on is exposed in Home Assistant through Supervisor ingress. Ingress requests bypass the direct API token only when the `X-Ingress-Path` header is accompanied by the documented Supervisor peer address `172.30.32.2` (default `trusted_ingress_cidrs: [172.30.32.2/32]`). Direct port mapping is optional and requires a configured Bearer API token; configure exact browser origins for CORS. CORS is not authentication. For remote use, keep the port unexposed and use Home Assistant remote access (such as Nabu Casa) for Home Assistant itself, or place the API behind a TLS reverse proxy with network restrictions. Do not publish an unauthenticated or plaintext public port.

The card's direct API token is saved in its Lovelace configuration, so use a dedicated token and limit dashboard/editor access. The API rate-limits clients to 60 requests per minute. Location is acquired on-device and is not persisted.

## Extension Points

Implement `FuelPriceProvider.fetch_stations()` to add another national source. Add fuel labels to `FUEL_LABELS`; the DGEG provider resolves their IDs by label. Price history, MQTT/sensor exposure, favorites, and detour-adjusted trip cost are deferred until a stable refresh/index contract is in use.
