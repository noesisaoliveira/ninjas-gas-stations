# Ninjas Gas Stations

Home Assistant add-on and Lovelace card for comparing nearby Portuguese fuel prices from the official DGEG service.

Validated for Home Assistant Core 2025.11+, Supervisor 2025.11+, and Home Assistant OS 16.x. Supported architectures are `amd64`, `aarch64`, and `armv7` (including Raspberry Pi 3). Each architecture has its own GHCR image tag. The CI uses the Home Assistant 2025.09 builder because 2025.11 dropped armv7 build support.

## Install

1. Add `https://github.com/noesisaoliveira/ninjas-gas-stations` to **Settings → Add-ons → Add-on store → ⋮ → Repositories**.
2. Install **Ninjas Gas Stations**, configure its settings, then start the add-on.
3. In **HACS**, open **⋮ → Custom repositories**. Add the same GitHub URL, select **Dashboard**, and choose **Add**.
4. Find **Ninjas Gas Stations Card** in HACS and select **Download**. Reload Home Assistant or the Companion app when prompted.
5. If the card is not recognized after reloading, go to **Settings → Dashboards → ⋮ → Resources** and add `/hacsfiles/ninjas-gas-stations/ninjas-gas-stations-card.js` as a JavaScript module.
6. Add a **Manual** card to a dashboard and use the YAML example below. The generated `ninjas-gas-stations-card.js` bundle is already included at the repository root for HACS.

The add-on is not exposed on a host port by default. For direct card access, set a dedicated `api_token`, enable native `ssl` using certificate files in Home Assistant's `/ssl` directory, map container port `8443/tcp` to a free host port (for example `8444`), and set `allowed_origins` to your exact dashboard origin. If remote access is needed, forward an unused router port (for example `9443`) to the HA host's mapped port. The card uses the HTTPS hostname and external port; do not expose plain HTTP `8099` publicly. Keep the existing Home Assistant UI router rule unchanged.

## Card YAML

```yaml
type: custom:ninjas-gas-stations-card
title: Ninjas Gas Stations
api_url: https://ha.example.com:9443
api_token: !secret ninjas_gas_api_token
radius_km: 15
limit: 5
estimate: 30
trump: false
fuels:
  - diesel
  - gasoline95
  - dieselprime
  - gasolineprime
  - gplauto
sort_by: diesel
navigation_app: waze
show_brand_logo: true
```

Fuel-sorted tabs show only the selected fuel price. **Nearest** shows the prices for all fuels configured on the card. Recognized brands use bundled logos when available; generic or unsupported brands show a fuel-pump symbol instead of initials.

`estimate` is the fill size in litres used for each estimated total (default `30`). Each station also shows the additional cost versus the cheapest visible station for that fuel. Set `trump: true` to show `BeforeTrumpWar`, the estimated fill-cost difference from fixed reference prices recorded at Plenergy Gaia II on 1 March 2026: diesel `1.385`, dieselprime `1.405`, gasoline95 `1.439`, gasolineprime `1.454`, and gplauto `0.818` €/L. A negative amount means today's estimated fill costs more than the reference. This is a user-provided static comparison, not live DGEG history; it is hidden by default.

You do not need an `entity` setting when using the iPhone's location permission prompt; leave it out and the card asks the browser or Companion app for location. To use Home Assistant's location entity instead, optionally add `entity: person.your_name` or `entity: device_tracker.your_phone` and enable Companion location tracking. Waze is opened using its app URL scheme, with an HTTPS fallback; iOS/Android may show a system confirmation depending on Companion/browser version.

## Configuration

### Card options

| Option | Default | Meaning |
| --- | ---: | --- |
| `radius_km` | 15 | Search radius, in km |
| `limit` | 5 | Maximum number of stations |
| `estimate` | 30 | Litres used for the estimated fill total and `BeforeTrumpWar` comparison |
| `trump` | `false` | Show the optional historical price comparison |
| `fuels` | diesel, gasoline95 | Fuel prices shown in **Nearest** mode |
| `sort_by` | diesel | Initial price sort; use `distance` for **Nearest** |
| `navigation_app` | `waze` | Navigation target: `waze`, `google`, or `apple` |
| `show_brand_logo` | `true` | Show bundled brand logos where available |

### Add-on options

| Option | Default | Meaning |
| --- | ---: | --- |
| `default_radius_km` | 15 | Radius used if the card omits one |
| `default_limit` | 5 | Number of results if omitted |
| `cache_ttl_minutes` | 60 | Station snapshot freshness |
| `brands_include` | `[]` | Optional case-insensitive brand allowlist |
| `brands_exclude` | `[]` | Optional case-insensitive brand denylist |
| `api_token` | empty | Required Bearer token for direct API access |
| `ssl` | `false` | Enable native HTTPS API on container port `8443` |
| `certfile` | `fullchain.pem` | TLS certificate filename under `/ssl` |
| `keyfile` | `privkey.pem` | TLS private key filename under `/ssl` |
| `allowed_origins` | empty | Comma-separated exact browser origins |
| `trusted_ingress_cidrs` | `172.30.32.2/32` | Supervisor ingress proxy IP, configurable for custom HA networks |
| `log_level` | `INFO` | Add-on log level |

`GET /api/stations` accepts `lat`, `lon`, `radius_km`, `limit`, `fuels`, and `sort`. Fuel aliases are `diesel`, `gasoline95`, `dieselprime`, `gasolineprime`, and `gplauto`; `gasolineprime` returns each station's lowest price among Gasolina 98, Gasolina especial 95, and Gasolina especial 98. `gplauto` returns GPL Auto in €/l. Sort accepts any fuel alias or `distance`. `/api/health` reports index status, and `/api/meta` lists provider and fuel aliases. All API routes require the Bearer token unless reached through authenticated Supervisor ingress. Direct HTTPS is available on `8443` when `ssl` is enabled; Supervisor ingress remains HTTP on `8099`.

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

Future enhancements may include favorites, detour-adjusted real cost, MQTT/Home Assistant sensors, and price trend indicators.
