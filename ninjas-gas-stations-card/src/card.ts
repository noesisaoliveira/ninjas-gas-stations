import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { entityLocation, fuelName, priceLevel, relativeUpdatedAt, sortStations } from "./logic";
import type { CardConfig, FuelKey, HomeAssistant, SortMode, StationsResponse, Station } from "./types";

const DEFAULT_CONFIG: Omit<CardConfig, "type" | "api_url"> = {
  radius_km: 15,
  limit: 5,
  fuels: ["diesel", "gasoline95"],
  sort_by: "diesel",
  navigation_app: "waze",
  show_brand_logo: true,
  title: "Ninjas Gas Stations",
};

@customElement("ninjas-gas-stations-card")
export class NinjasGasStationsCard extends LitElement {
  @property({ attribute: false })
  set hass(value: HomeAssistant | undefined) {
    const previous = this._hass;
    this._hass = value;
    if (previous !== value) void this.refreshIfLocationChanged();
  }
  get hass() { return this._hass; }

  @state() private _hass?: HomeAssistant;
  @state() private _config?: CardConfig;
  @state() private _stations: Station[] = [];
  @state() private _busy = false;
  @state() private _error = "";
  @state() private _locationMissing = false;
  @state() private _stale = false;
  @state() private _sort: SortMode = "diesel";
  private _location?: { lat: number; lon: number };
  private _observer?: IntersectionObserver;
  private _pendingTimer?: number;
  private _lastRequest = 0;

  static styles = css`
    :host { display:block; color:var(--primary-text-color); }
    ha-card { overflow:hidden; }
    .head { align-items:center; border-bottom:1px solid var(--divider-color); display:flex; gap:12px; justify-content:space-between; padding:16px; }
    h2 { font-size:1.05rem; font-weight:650; margin:0; }
    .subtitle { color:var(--secondary-text-color); font-size:.82rem; margin-top:4px; }
    button { align-items:center; background:var(--secondary-background-color); border:0; border-radius:8px; color:var(--primary-text-color); cursor:pointer; display:inline-flex; justify-content:center; min-height:44px; min-width:44px; padding:8px 12px; }
    button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .refresh { font-size:1.25rem; }
    .modes { display:flex; gap:4px; padding:10px 12px 2px; }
    .modes button { flex:1; font-size:.76rem; min-height:40px; padding:6px; }
    .modes [aria-pressed="true"] { background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .rows { list-style:none; margin:0; padding:0 12px 8px; }
    .row { align-items:center; border-bottom:1px solid var(--divider-color); display:grid; gap:10px; grid-template-columns:30px 38px minmax(0,1fr) auto 44px; min-height:92px; padding:10px 4px; }
    .row:last-child { border-bottom:0; }
    .rank { color:var(--secondary-text-color); font-size:.82rem; text-align:center; }
    .brand { align-items:center; background:var(--secondary-background-color); border-radius:50%; display:flex; font-size:.7rem; font-weight:700; height:36px; justify-content:center; overflow:hidden; width:36px; }
    .details { min-width:0; }
    .name { font-size:.91rem; font-weight:600; line-height:1.25; overflow-wrap:anywhere; }
    .place,.updated { color:var(--secondary-text-color); font-size:.76rem; margin-top:4px; }
    .prices { display:grid; gap:5px; min-width:88px; }
    .price { font-variant-numeric:tabular-nums; font-size:.83rem; text-align:right; white-space:nowrap; }
    .price small { color:var(--secondary-text-color); display:block; font-size:.66rem; }
    .low { color:var(--success-color, #238636); } .mid { color:var(--warning-color, #9a6700); } .high { color:var(--error-color, #cf222e); }
    .cheapest { background:var(--success-color, #238636); border-radius:3px; color:#fff; display:inline-block; font-size:.64rem; margin:4px 0 0; padding:2px 5px; }
    .distance { color:var(--secondary-text-color); font-size:.72rem; margin-top:4px; }
    .nav { font-size:1.12rem; }
    .notice { color:var(--secondary-text-color); font-size:.85rem; padding:22px 18px; text-align:center; }
    .notice.error { color:var(--error-color, #cf222e); }
    .warning { color:var(--warning-color, #9a6700); font-size:.76rem; padding:8px 16px; }
    .skeleton { animation:pulse 1.2s ease-in-out infinite alternate; background:var(--secondary-background-color); border-radius:4px; height:12px; margin:10px 0; }
    @keyframes pulse { to { opacity:.45; } }
    @media (max-width:420px) { .row { gap:6px; grid-template-columns:24px 32px minmax(0,1fr) auto 40px; } .brand { height:30px; width:30px; } .prices { min-width:76px; } .price { font-size:.76rem; } }
  `;

  setConfig(config: Partial<CardConfig>) {
    if (!config.api_url) throw new Error("Ninjas Gas Stations card requires api_url");
    this._config = { ...DEFAULT_CONFIG, ...config, type: "custom:ninjas-gas-stations-card", api_url: config.api_url.replace(/\/$/, "") } as CardConfig;
    this._sort = this._config.sort_by;
  }

  connectedCallback() {
    super.connectedCallback();
    this._observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void this.refresh();
    });
    this._observer.observe(this);
    document.addEventListener("visibilitychange", this.visibilityChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
    document.removeEventListener("visibilitychange", this.visibilityChanged);
    if (this._pendingTimer) window.clearTimeout(this._pendingTimer);
  }

  private visibilityChanged = () => {
    if (document.visibilityState === "visible") void this.refresh();
  };

  private async refreshIfLocationChanged() {
    const location = this.readEntityLocation();
    if (!location) return;
    const moved = !this._location || this.distanceMeters(this._location, location) > 300;
    this._location = location;
    if (moved && this.isConnected) {
      if (this._pendingTimer) window.clearTimeout(this._pendingTimer);
      this._pendingTimer = window.setTimeout(() => void this.refresh(), 350);
    }
  }

  private readEntityLocation() {
    const entityId = this._config?.entity;
    return entityLocation(entityId ? this._hass?.states[entityId] : undefined);
  }

  private distanceMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const toRad = (value: number) => value * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const angle = 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2));
    return angle * 6_371_000;
  }

  private async getLocation() {
    const fromEntity = this.readEntityLocation();
    if (fromEntity) return fromEntity;
    if (!navigator.geolocation) return undefined;
    return new Promise<{ lat: number; lon: number } | undefined>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
        () => resolve(undefined),
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      );
    });
  }

  private async refresh() {
    if (!this._config || this._busy || Date.now() - this._lastRequest < 700) return;
    this._busy = true;
    this._error = "";
    this._locationMissing = false;
    try {
      const location = await this.getLocation();
      if (!location) {
        this._locationMissing = true;
        return;
      }
      this._location = location;
      const parameters = new URLSearchParams({
        lat: String(location.lat), lon: String(location.lon),
        radius_km: String(this._config.radius_km), limit: String(this._config.limit),
        fuels: this._config.fuels.join(","), sort: this._sort,
      });
      const response = await fetch(`${this._config.api_url}/api/stations?${parameters}`, {
        headers: this._config.api_token ? { Authorization: `Bearer ${this._config.api_token}` } : {},
      });
      if (!response.ok) throw new Error(`Fuel service returned ${response.status}`);
      const body = await response.json() as StationsResponse;
      this._stations = sortStations(body.stations, this._sort);
      this._stale = body.stale;
      this._lastRequest = Date.now();
    } catch (error) {
      this._error = error instanceof Error ? error.message : "Unable to load nearby stations";
    } finally {
      this._busy = false;
    }
  }

  private setSort(sort: SortMode) {
    this._sort = sort;
    void this.refresh();
  }

  private openNavigation(station: Station) {
    const app = this._config?.navigation_app ?? "waze";
    const url = app === "google" ? station.google_maps_url : app === "apple" ? station.apple_maps_url : station.waze_url;
    if (app !== "waze") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const scheme = `waze://?ll=${station.lat},${station.lon}&navigate=yes`;
    const startedAt = Date.now();
    window.location.href = scheme;
    window.setTimeout(() => {
      if (document.visibilityState === "visible" && Date.now() - startedAt < 2500) window.location.href = url;
    }, 900);
  }

  private renderPrice(station: Station, fuel: FuelKey, group: Station[]) {
    const price = station.prices[fuel];
    if (!price) return nothing;
    const values = group.map((item) => item.prices[fuel]?.price_eur).filter((value): value is number => value !== undefined);
    const cheapest = values.length > 0 && price.price_eur === Math.min(...values);
    return html`<div class="price ${priceLevel(price.price_eur, values)}">
      ${price.price_eur.toFixed(3)} €/l<small>${fuelName(fuel, this._hass?.language)}</small>
      <small>${relativeUpdatedAt(price.updated_at, this._hass?.language)}</small>
      ${cheapest ? html`<span class="cheapest">${this._hass?.language?.startsWith("pt") ? "Mais barato" : "Cheapest"}</span>` : nothing}
    </div>`;
  }

  private renderStation(station: Station, index: number) {
    const fuels = this._config?.fuels ?? ["diesel", "gasoline95"];
    return html`<li class="row">
      <span class="rank" aria-label=${`Rank ${index + 1}`}>${index + 1}</span>
      ${this._config?.show_brand_logo ? html`<span class="brand" aria-hidden="true">${(station.brand || station.name).slice(0, 2).toUpperCase()}</span>` : nothing}
      <div class="details"><div class="name">${station.name}</div>
        <div class="place">${[station.brand, station.municipality].filter(Boolean).join(" · ")}</div>
        <div class="distance">${station.distance_km.toFixed(1)} km</div></div>
      <div class="prices">${fuels.map((fuel) => this.renderPrice(station, fuel, this._stations))}</div>
      <button class="nav" aria-label=${`Navigate to ${station.name} using ${this._config?.navigation_app}`} title="Navigate" @click=${() => this.openNavigation(station)}>↗</button>
    </li>`;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("ninjas-gas-stations-card-editor");
  }

  render() {
    if (!this._config) return nothing;
    const pt = this._hass?.language?.toLowerCase().startsWith("pt") ?? false;
    return html`<ha-card>
      <header class="head"><div><h2>${this._config.title}</h2>
        <div class="subtitle">${this._config.radius_km} km · ${this._stations.length} ${pt ? "postos" : "stations"}</div></div>
        <button class="refresh" aria-label=${pt ? "Atualizar postos" : "Refresh stations"} title=${pt ? "Atualizar" : "Refresh"} ?disabled=${this._busy} @click=${() => void this.refresh()}>↻</button>
      </header>
      <nav class="modes" aria-label=${pt ? "Ordenar por" : "Sort by"}>
        ${(["diesel", "gasoline95", "distance"] as const).map((mode) => html`<button aria-pressed=${this._sort === mode} @click=${() => this.setSort(mode)}>${mode === "diesel" ? (pt ? "Gasóleo" : "Diesel") : mode === "gasoline95" ? "95" : (pt ? "Distância" : "Nearest")}</button>`)}
      </nav>
      ${this._stale ? html`<div class="warning" role="status">${pt ? "Preços em cache: atualização temporariamente indisponível." : "Cached prices: live refresh is temporarily unavailable."}</div>` : nothing}
      ${this._busy && !this._stations.length ? html`<div class="notice" aria-label="Loading">${[1, 2, 3].map(() => html`<div class="skeleton"></div>`)}</div>` : nothing}
      ${this._locationMissing ? html`<div class="notice" role="status">${pt ? "Ative a localização no Companion ou permita o acesso à localização do navegador." : "Enable Companion location tracking or allow browser location access."}</div>` : nothing}
      ${this._error ? html`<div class="notice error" role="alert">${this._error}<br><button @click=${() => void this.refresh()}>${pt ? "Tentar novamente" : "Retry"}</button></div>` : nothing}
      ${!this._busy && !this._error && !this._locationMissing && !this._stations.length ? html`<div class="notice">${pt ? `Sem postos num raio de ${this._config.radius_km} km` : `No stations within ${this._config.radius_km} km`}</div>` : nothing}
      ${this._stations.length ? html`<ol class="rows">${this._stations.map((station, index) => this.renderStation(station, index))}</ol>` : nothing}
    </ha-card>`;
  }

  static getStubConfig(): Partial<CardConfig> {
    return { ...DEFAULT_CONFIG, api_url: "http://homeassistant.local:8099" };
  }
}
