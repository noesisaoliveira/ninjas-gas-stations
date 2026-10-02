export type FuelKey = "diesel" | "gasoline95";
export type SortMode = FuelKey | "distance";

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language?: string;
}

export interface FuelPrice {
  label: string;
  price_eur: number;
  updated_at: string | null;
}

export interface Station {
  id: string;
  name: string;
  brand: string | null;
  address: string | null;
  municipality: string | null;
  lat: number;
  lon: number;
  distance_km: number;
  prices: Partial<Record<FuelKey, FuelPrice>>;
  opening_hours: string | null;
  waze_url: string;
  google_maps_url: string;
  apple_maps_url: string;
}

export interface CardConfig {
  type: string;
  entity?: string;
  api_url: string;
  api_token?: string;
  radius_km: number;
  limit: number;
  fuels: FuelKey[];
  sort_by: SortMode;
  navigation_app: "waze" | "google" | "apple";
  show_brand_logo: boolean;
  title: string;
}

export interface StationsResponse {
  stations: Station[];
  stale: boolean;
  last_refresh: string | null;
}
