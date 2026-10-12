# Changelog

Notable changes to Ninjas Gas Stations are documented here. Versions are listed newest first.

## 0.1.13 - 2026-10-12

- Corrected `BeforeTrumpWar` sign: higher current fuel prices than the historical baseline now show a negative estimated difference.

## 0.1.12 - 2026-10-12

- Added a `trump` card setting, disabled by default, to optionally show the estimated fill-cost difference from the fixed historical fuel prices.
- Added fixed historical reference prices for diesel, premium diesel, gasoline 95, premium gasoline, and GPL Auto; the comparison uses the configured `estimate` litres.

## 0.1.11 - 2026-10-12

- Added a configurable `estimate` litre amount to the Lovelace card, with per-station total cost and the difference from the cheapest visible station.
- Bundled additional station marks for Galp, Repsol, PRIO, Moeve/CEPSA, Alves Bandeira, OZ Energia, Plenergy/Plenoil, and BP.

## 0.1.10 - 2026-10-12

- Added GPL Auto as a standalone fuel tab and price returned by the API.
- Added GPL Auto to card configuration, nearest-mode options, provider cache refresh, and sorting.

## 0.1.9 - 2026-10-12

- In fuel-sorted card modes, show only the selected fuel price; Nearest shows every configured fuel price.
- Replaced station initials with bundled logos for recognized brands and a generic fuel-pump mark when no brand logo is available.

## 0.1.8 - 2026-10-12

- Added `dieselprime` for Gasóleo especial.
- Added `gasolineprime`, which uses each station's lowest available price among Gasolina 98, Gasolina especial 95, and Gasolina especial 98.
- Added prime fuels to the card editor and sorting controls; the selected gasoline grade is shown with its price.
- Existing cached station data is retained as fallback and refreshed immediately after updating to include the added fuels.

## 0.1.7 - 2026-10-12

- Added `dieselprime` for Gasóleo especial.
- Added `gasolineprime`, which uses the lowest per-station price among Gasolina 98, Gasolina especial 95, and Gasolina especial 98.
- Added the two fuel aliases to card configuration and sorting.

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
