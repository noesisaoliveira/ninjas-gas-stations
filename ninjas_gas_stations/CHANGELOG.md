# Changelog

Notable changes to Ninjas Gas Stations are documented here. Versions are listed newest first.

## 0.1.6 - 2026-10-11

- Added step-by-step HACS custom repository installation instructions.
- Clarified that the Lovelace card's `entity` option is optional when using browser or Companion location permission.

## 0.1.5 - 2026-10-11

- Added optional native HTTPS for direct API access on port 8443 while keeping Supervisor ingress on HTTP port 8099.
- Added TLS certificate and private-key filename options using Home Assistant's `/ssl` directory.

## 0.1.4 - 2026-10-11

- Fixed API authentication when the configured token contains non-ASCII characters.

## 0.1.3 - 2026-10-02

- Fixed startup when the configured log level is lowercase, such as `debug`.

## 0.1.2 - 2026-10-02

- Published separate architecture-specific images so Raspberry Pi 3 armv7 devices receive the correct image.

## 0.1.1 - 2026-10-02

- Added armv7 support and updated the multi-architecture build workflow.
- Added step-by-step add-on and Lovelace setup instructions.

## 0.1.0 - 2026-10-02

- Initial release of the DGEG-powered Home Assistant add-on and Lovelace card.
