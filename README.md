# Ninjas Gas Stations

Home Assistant add-on and Lovelace card for comparing nearby Portuguese fuel prices from the official DGEG service.

Validated for Home Assistant Core 2025.11+, Supervisor 2025.11+, and Home Assistant OS 16.x on `amd64` and `aarch64`. The repository builder workflows target the Home Assistant 2025.11 builder; `armv7` is intentionally not listed because that builder generation dropped support for it.

Screenshots for light and dark themes will be added after Companion-app validation.

## Install

1. Add `https://github.com/noesisaoliveira/ninjas-gas-stations` to **Settings → Add-ons → Add-on store → ⋮ → Repositories**.
2. Install **Ninjas Gas Stations**, configure the radius/cache and an API token if using direct access, then start the add-on.
3. Install the card from HACS as a custom **Dashboard** repository using the same repository. If distributing this monorepo, ensure the release contains the generated root `ninjas-gas-stations-card.js` bundle.
4. In **Settings → Dashboards → Resources**, add `/hacsfiles/ninjas-gas-stations/ninjas-gas-stations-card.js` as a JavaScript module if HACS has not registered it.

The add-on is not exposed on a host port by default. For card-to-API calls, set a dedicated `api_token`, add your exact Home Assistant origin to `allowed_origins`, and map the add-on port only on a trusted network or behind a TLS reverse proxy. Use the same API base URL and token in the card. Do not use an HTTP endpoint over the public internet.

## Card YAML

```yaml
type: custom:ninjas-gas-stations-card
title: Ninjas Gas Stations
entity: person.alex
api_url: https://gas-api.example.net
api_token: !secret ninjas_gas_api_token
radius_km: 15
limit: 5
fuels:
  - diesel
  - gasoline95
sort_by: diesel
navigation_app: waze
show_brand_logo: true
```

Configure the Companion app's location sensor (`device_tracker.*`) or a `person.*` entity and grant location permission. If entity coordinates are unavailable, the card asks for browser geolocation when visible. Waze is opened using its app URL scheme, with an HTTPS fallback; iOS/Android may show a system confirmation depending on Companion/browser version.

## Configuration

| Option | Default | Meaning |
| --- | ---: | --- |
| `default_radius_km` | 15 | Radius used if the card omits one |
| `default_limit` | 5 | Number of results if omitted |
| `cache_ttl_minutes` | 60 | Station snapshot freshness |
| `brands_include` | `[]` | Optional case-insensitive brand allowlist |
| `brands_exclude` | `[]` | Optional case-insensitive brand denylist |
| `api_token` | empty | Required Bearer token for direct API access |
| `allowed_origins` | empty | Comma-separated exact browser origins |
| `trusted_ingress_cidrs` | `172.30.32.2/32` | Supervisor ingress proxy IP, configurable for custom HA networks |
| `log_level` | `INFO` | Add-on log level |

`GET /api/stations` accepts `lat`, `lon`, `radius_km`, `limit`, `fuels`, and `sort` (`diesel`, `gasoline95`, or `distance`). `/api/health` reports index status, and `/api/meta` lists provider and fuel aliases. All API routes require the Bearer token unless reached through authenticated Supervisor ingress.

## Local Development

Run the built-in mock Home Assistant card preview:

```powershell
cd ninjas-gas-stations-card
npm ci
npm run dev -- --host localhost --open /dev/mock_ha.html
```

The mock dashboard opens at `http://localhost:5173/dev/mock_ha.html`, uses a fixed Lisbon `person.demo`, and returns five deterministic sample stations without requesting GPS permission. Browser geolocation requires a secure context (`localhost` qualifies).

To connect that mock dashboard to the real add-on API, start the backend in another terminal:

```powershell
cd ninjas_gas_stations
pip install -r requirements-dev.txt
$env:DATA_DIR = "$PWD/data"
$env:OPTIONS_FILE = "$PWD/dev-options.json"
Set-Content -Path $env:OPTIONS_FILE -Value '{"default_radius_km":15,"default_limit":5,"cache_ttl_minutes":60,"api_token":"local-dev-token","allowed_origins":"http://localhost:5173"}'
python -m uvicorn app.main:app --host 127.0.0.1 --port 8099 --reload
```

Open `http://localhost:5173/dev/mock_ha.html?live=1` to bypass the browser mock and use live DGEG data. First indexing can make the initial request take a while. For a real Companion-device test, use a trusted HTTPS reverse proxy and a matching allowed origin.

To install the add-on from the Home Assistant CLI:

```sh
ha addons repository add https://github.com/noesisaoliveira/ninjas-gas-stations
ha addons install ninjas_gas_stations
ha addons start ninjas_gas_stations
```

Then add the generated HACS resource and paste the card YAML above into a dashboard. HACS installs the `ninjas-gas-stations-card.js` file from the repository root.

## Troubleshooting

- **No location:** enable Companion location tracking, verify entity attributes include numeric `latitude` and `longitude`, or allow browser geolocation.
- **401:** set the same dedicated `api_token` in the add-on and card. Ingress is not a direct API URL.
- **CORS error:** set `allowed_origins` to the dashboard origin exactly, including scheme and port.
- **No stations:** check DGEG availability and radius. If the cache is empty, first indexing may take a while because DGEG provides paginated national results rather than a radius query.
- **Stale warning:** cached results are served during an upstream outage; check add-on logs and retry later.
- **Navigation app not opened:** mobile operating systems control custom URL scheme prompts; HTTPS Waze fallback remains available.

## Roadmap

Fuel type extensibility is built into the provider. Future additions: favorites, detour-adjusted real cost, MQTT/HA sensors, price trend arrows, and expanded fuels such as Gasolina 98, GPL, and Gasóleo colorido.
