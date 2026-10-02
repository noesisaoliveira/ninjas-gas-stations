# Ninjas Gas Stations

The add-on reads public fuel prices from the official Portuguese DGEG website and keeps a persistent cache in `/data`. Its ingress panel is authenticated by Home Assistant. The optional mapped port requires the configured `api_token` as a Bearer token and should only be exposed behind a trusted TLS reverse proxy or on a trusted private network.

Set `allowed_origins` to the exact dashboard origin when using the direct API from a Lovelace card. CORS is not an authentication mechanism. Do not expose the add-on port to the public internet without TLS and network-level access controls.

The DGEG API is public and has no published service-level agreement. Results can be stale during an outage. Fuel-type IDs are resolved by their live Portuguese labels at refresh time.

See the root README for the card setup and API reference.
