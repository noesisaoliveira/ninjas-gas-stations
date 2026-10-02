import "./editor";
import "./card";

const CARD_TAG = "ninjas-gas-stations-card";
const cards = (window as Window & { customCards?: Array<Record<string, unknown>> }).customCards ?? [];
cards.push({ type: CARD_TAG, name: "Ninjas Gas Stations", description: "Nearby Portuguese fuel prices from DGEG" });
(window as Window & { customCards?: Array<Record<string, unknown>> }).customCards = cards;

export { NinjasGasStationsCard } from "./card";
export { entityLocation, fuelName, priceLevel, relativeUpdatedAt, sortStations } from "./logic";
