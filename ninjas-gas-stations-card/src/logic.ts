import type { FuelKey, HassEntity, SortMode, Station } from "./types";

export const FUEL_KEYS = ["diesel", "gasoline95", "dieselprime", "gasolineprime", "gplauto"] as const;
export const SORT_MODES = [...FUEL_KEYS, "distance"] as const;
export const HISTORICAL_FUEL_PRICES: Record<FuelKey, number> = {
  diesel: 1.385,
  dieselprime: 1.405,
  gasoline95: 1.439,
  gasolineprime: 1.454,
  gplauto: 0.818,
};

export function entityLocation(entity: HassEntity | undefined): { lat: number; lon: number } | undefined {
  if (!entity) return undefined;
  const lat = Number(entity.attributes.latitude);
  const lon = Number(entity.attributes.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return undefined;
  }
  return { lat, lon };
}

export function sortStations(stations: Station[], mode: SortMode): Station[] {
  return [...stations].sort((left, right) => {
    if (mode === "distance") return left.distance_km - right.distance_km;
    const leftPrice = left.prices[mode]?.price_eur ?? Number.POSITIVE_INFINITY;
    const rightPrice = right.prices[mode]?.price_eur ?? Number.POSITIVE_INFINITY;
    return leftPrice - rightPrice || left.distance_km - right.distance_km;
  });
}

export function displayedFuels(configured: FuelKey[], mode: SortMode): FuelKey[] {
  return mode === "distance" ? [...configured] : [mode];
}

export function priceLevel(price: number, prices: number[]): "low" | "mid" | "high" {
  const sorted = [...prices].sort((left, right) => left - right);
  const rank = sorted.indexOf(price);
  if (rank <= Math.floor((sorted.length - 1) / 3)) return "low";
  if (rank >= Math.ceil(((sorted.length - 1) * 2) / 3)) return "high";
  return "mid";
}

export function fuelEstimate(price: number, prices: number[], liters: number): { total: number; difference: number } {
  const cheapest = prices.length > 0 ? Math.min(...prices) : price;
  const roundCurrency = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
  return {
    total: roundCurrency(price * liters),
    difference: roundCurrency(Math.max(0, (price - cheapest) * liters)),
  };
}

export function beforeTrumpWarDifference(fuel: FuelKey, currentPrice: number, liters: number): number {
  return Math.round((HISTORICAL_FUEL_PRICES[fuel] - currentPrice) * liters * 100) / 100;
}

export function fuelName(key: FuelKey, language?: string): string {
  const portuguese = language?.toLowerCase().startsWith("pt");
  if (key === "diesel") return portuguese ? "Gasóleo simples" : "Diesel";
  if (key === "gasoline95") return portuguese ? "Gasolina simples 95" : "Gasoline 95";
  if (key === "dieselprime") return portuguese ? "Gasóleo especial" : "Premium diesel";
  if (key === "gasolineprime") return portuguese ? "Gasolina premium" : "Premium gasoline";
  return "GPL Auto";
}

export function relativeUpdatedAt(value: string | null, language?: string): string {
  if (!value) return language?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const ageMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ageMs)) return language?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const hours = Math.max(0, Math.floor(ageMs / 3_600_000));
  if (hours < 1) return language?.startsWith("pt") ? "Atualizado há menos de 1 h" : "Updated less than 1 h ago";
  if (hours < 24) return language?.startsWith("pt") ? `Atualizado há ${hours} h` : `Updated ${hours} h ago`;
  const days = Math.floor(hours / 24);
  return language?.startsWith("pt") ? `Atualizado há ${days} d` : `Updated ${days} d ago`;
}
