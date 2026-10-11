# Ninjas Gas Stations

Find nearby fuel stations in Portugal using public prices from the official DGEG website. The add-on keeps a persistent station cache in `/data`; the default refresh interval is 60 minutes.

## After Installation

1. Open **Settings → Add-ons → Ninjas Gas Stations → Configuration**.
2. Set `default_radius_km` and `default_limit` if you want defaults other than 15 km and 5 stations. The Lovelace card can override both.
3. For a dashboard card that calls the API directly, enter a unique random value in `api_token`. Keep this token private; the card must send the same value as a Bearer token.
4. Set `allowed_origins` to the exact origin used to open your Home Assistant dashboard. Include the scheme and port, but no path or trailing slash. Examples: `http://homeassistant.local:8123` or `https://olivehe.duckdns.org`.
5. If the dashboard is HTTPS or you need remote access, enable `ssl`, leave `certfile` as `fullchain.pem` and `keyfile` as `privkey.pem` (unless your certificate files use different names), and make sure those files exist in Home Assistant's `/ssl` directory. They are mounted read-only into this add-on. Direct TLS listens on port `8443`; Supervisor ingress remains HTTP on internal port `8099`.
6. In the add-on's **Network** section, map `8443/tcp` to host port `8443`. For remote access, configure your router to forward TCP port `8443` to the Home Assistant host's port `8443`. The certificate must be valid for the hostname in the card URL. Keep the API token enabled.
7. Save the configuration and start or restart the add-on. Test direct TLS from a network terminal with `curl -H "Authorization: Bearer <your-token>" https://olivehe.duckdns.org:8443/api/health`.

For a LAN-only dashboard loaded over HTTP, you may leave `ssl` disabled and map HTTP port `8099` instead. An HTTPS dashboard cannot call a plain HTTP API because browsers block mixed content. The add-on's ingress panel stays available on port `8099` and is authenticated by Home Assistant; its temporary ingress URL is not a stable API URL for the card.

## Connect the Lovelace Card

Install the **Ninjas Gas Stations Card** from HACS as a custom Dashboard repository, then add it as a manual card:

```yaml
type: custom:ninjas-gas-stations-card
title: Ninjas Gas Stations
entity: device_tracker.your_phone
api_url: https://olivehe.duckdns.org:8443
api_token: YOUR_CONFIGURED_API_TOKEN
radius_km: 15
limit: 5
fuels:
  - diesel
  - gasoline95
sort_by: diesel
navigation_app: waze
show_brand_logo: true
```

Replace `device_tracker.your_phone` with the Companion app's location entity or a `person.*` entity. Replace the API URL with the certificate-covered HTTPS hostname and port `8443` reachable from the phone or browser. Set `allowed_origins` to the exact Home Assistant dashboard origin (usually the same hostname without `:8443`). Do not put a long-lived token in a dashboard shared with untrusted users.

In the Companion app, enable location tracking and grant location permission. Confirm the entity has numeric `latitude` and `longitude` attributes. If entity coordinates are unavailable, the card can request browser geolocation as a fallback.

## Add-on Options

| Option | Default | Description |
| --- | --- | --- |
| `default_radius_km` | `15` | Search radius in kilometres when not set on the card. |
| `default_limit` | `5` | Maximum number of stations when not set on the card. |
| `cache_ttl_minutes` | `60` | How long a DGEG station snapshot stays fresh. Cached results are retained when DGEG is unavailable. |
| `brands_include` | empty | Optional brand allowlist, for example `Galp` or `PRIO`. |
| `brands_exclude` | empty | Optional brand denylist. |
| `api_token` | empty | Required Bearer token for requests through the mapped port. Generate a unique token and do not reuse a Home Assistant password. |
| `ssl` | `false` | Enable direct HTTPS API listener on container port `8443`. Supervisor ingress remains HTTP on `8099`. |
| `certfile` | `fullchain.pem` | TLS certificate chain filename under `/ssl`. |
| `keyfile` | `privkey.pem` | TLS private key filename under `/ssl`. |
| `allowed_origins` | empty | Comma-separated exact browser origins allowed by CORS. CORS is not authentication. |
| `trusted_ingress_cidrs` | `172.30.32.2/32` | Supervisor ingress proxy address. Change only if your Home Assistant network uses a different ingress proxy address. |
| `log_level` | `INFO` | Add-on log verbosity: `DEBUG`, `INFO`, `WARNING`, or `ERROR`. |

## API

The add-on always listens on HTTP port `8099` internally for authenticated Supervisor ingress. When `ssl` is enabled, it also listens for direct API traffic over HTTPS on port `8443`. Neither port is mapped to the host by default.

- `GET /api/health`: station index status and last refresh time.
- `GET /api/meta`: provider and supported fuel aliases.
- `GET /api/stations?lat=<latitude>&lon=<longitude>&radius_km=15&limit=5&fuels=diesel,gasoline95&sort=diesel`: nearby station search. Sort can be `diesel`, `gasoline95`, or `distance`.

Direct requests require `Authorization: Bearer <api_token>`. Requests through Supervisor ingress are accepted only from the configured trusted ingress address. The DGEG service has no published service-level agreement; prices can be stale during an outage. Fuel IDs are resolved from their live Portuguese labels.

## Troubleshooting

- **401 response:** the card token must exactly match the add-on's `api_token`; send it as a Bearer token.
- **Network error or timeout:** for HTTPS, enable `ssl`, confirm the certificate/key files exist under `/ssl`, map and forward port `8443/tcp`, and use `https://<certificate-hostname>:8443` in `api_url`. For LAN-only HTTP, map `8099/tcp` and use `http://<HA-LAN-IP>:8099` from an HTTP dashboard.
- **CORS error:** set `allowed_origins` to the dashboard origin exactly, including scheme and port. Do not add a path or trailing slash.
- **No location:** enable Companion location tracking, choose the correct `device_tracker.*` or `person.*` entity, and check its latitude/longitude attributes.
- **No stations or slow first search:** DGEG provides paginated national results rather than a radius endpoint. Initial indexing can take time; cached results are used during later upstream outages.
- **Stale-price warning:** the API is serving its saved cache because a fresh DGEG update was unavailable. Check the add-on log and retry later.
