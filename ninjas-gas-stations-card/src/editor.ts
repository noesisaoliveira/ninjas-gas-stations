import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CardConfig, HomeAssistant } from "./types";

@customElement("ninjas-gas-stations-card-editor")
export class NinjasGasStationsCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) config?: CardConfig;

  static styles = css`
    ha-form { display: block; }
  `;

  private get schema() {
    return [
      { name: "title", selector: { text: {} } },
      { name: "entity", selector: { entity: { filter: [{ domain: ["device_tracker", "person"] }] } } },
      { name: "api_url", selector: { text: { type: "url" } } },
      { name: "api_token", selector: { text: { type: "password" } } },
      { name: "radius_km", selector: { number: { min: 1, max: 500, step: 1, mode: "box", unit_of_measurement: "km" } } },
      { name: "limit", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } },
      { name: "fuels", selector: { select: { multiple: true, options: [{ value: "diesel", label: "Gasóleo simples" }, { value: "gasoline95", label: "Gasolina simples 95" }] } } },
      { name: "sort_by", selector: { select: { options: [{ value: "diesel", label: "Cheapest diesel" }, { value: "gasoline95", label: "Cheapest gasoline 95" }, { value: "distance", label: "Nearest" }] } } },
      { name: "navigation_app", selector: { select: { options: [{ value: "waze", label: "Waze" }, { value: "google", label: "Google Maps" }, { value: "apple", label: "Apple Maps" }] } } },
      { name: "show_brand_logo", selector: { boolean: {} } },
    ];
  }

  private changed(event: CustomEvent<{ value: Record<string, unknown> }>) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: { ...this.config, ...event.detail.value } },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`<ha-form .hass=${this.hass} .data=${this.config ?? {}} .schema=${this.schema}
      .computeLabel=${(schema: { name: string }) => schema.name.replaceAll("_", " ")}
      @value-changed=${this.changed}></ha-form>`;
  }
}
