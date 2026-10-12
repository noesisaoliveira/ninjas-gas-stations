import { describe, expect, it } from "vitest";
import { entityLocation, priceLevel, sortStations } from "./logic";
import type { Station } from "./types";

const station = (id: string, distance: number, diesel?: number): Station => ({
  id, name: id, brand: null, address: null, municipality: null, lat: 0, lon: 0,
  distance_km: distance, prices: diesel === undefined ? {} : { diesel: { label: "Gasóleo simples", price_eur: diesel, updated_at: null } },
  opening_hours: null, waze_url: "", google_maps_url: "", apple_maps_url: "",
});

describe("card logic", () => {
  it("accepts coordinates only when both entity attributes are valid", () => {
    expect(entityLocation({ state: "home", attributes: { latitude: 38.7, longitude: -9.1 } })).toEqual({ lat: 38.7, lon: -9.1 });
    expect(entityLocation({ state: "unknown", attributes: { latitude: "unknown", longitude: 0 } })).toBeUndefined();
  });

  it("sorts by selected fuel or distance with stable tie breaks", () => {
    expect(sortStations([station("far", 8, 1.5), station("cheap", 4, 1.4)], "diesel").map((item) => item.id)).toEqual(["cheap", "far"]);
    expect(sortStations([station("far", 8), station("near", 1)], "distance").map((item) => item.id)).toEqual(["near", "far"]);
  });

  it("sorts premium gasoline by the cheapest selected grade", () => {
    const expensive = station("expensive", 2);
    expensive.prices.gasolineprime = {
      label: "Gasolina 98",
      price_eur: 1.9,
      updated_at: null,
    };
    const cheapest = station("cheapest", 3);
    cheapest.prices.gasolineprime = {
      label: "Gasolina especial 95",
      price_eur: 1.75,
      updated_at: null,
    };

    expect(sortStations([expensive, cheapest], "gasolineprime").map((item) => item.id)).toEqual([
      "cheapest",
      "expensive",
    ]);
  });

  it("assigns relative price levels", () => {
    expect(priceLevel(1, [1, 2, 3])).toBe("low");
    expect(priceLevel(3, [1, 2, 3])).toBe("high");
  });
});
