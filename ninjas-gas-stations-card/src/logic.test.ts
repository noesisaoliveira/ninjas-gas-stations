import { describe, expect, it } from "vitest";
import { brandMark } from "./brand-icons";
import { displayedFuels, entityLocation, fuelEstimate, FUEL_KEYS, priceLevel, SORT_MODES, sortStations } from "./logic";
import type { Station } from "./types";

const station = (id: string, distance: number, diesel?: number): Station => ({
  id, name: id, brand: null, address: null, municipality: null, lat: 0, lon: 0,
  distance_km: distance, prices: diesel === undefined ? {} : { diesel: { label: "Gasóleo simples", price_eur: diesel, updated_at: null } },
  opening_hours: null, waze_url: "", google_maps_url: "", apple_maps_url: "",
});

describe("card logic", () => {
  it("exposes all fuel tabs plus nearest", () => {
    expect(FUEL_KEYS).toEqual(["diesel", "gasoline95", "dieselprime", "gasolineprime", "gplauto"]);
    expect(SORT_MODES).toEqual([...FUEL_KEYS, "distance"]);
  });

  it("accepts coordinates only when both entity attributes are valid", () => {
    expect(entityLocation({ state: "home", attributes: { latitude: 38.7, longitude: -9.1 } })).toEqual({ lat: 38.7, lon: -9.1 });
    expect(entityLocation({ state: "unknown", attributes: { latitude: "unknown", longitude: 0 } })).toBeUndefined();
  });

  it("uses bundled logos for known brands and no initials for unknown brands", () => {
    expect(brandMark("INTERMARCHÉ")).toBeDefined();
    expect(brandMark("E.Leclerc")).toBeDefined();
    expect(brandMark("Galp")).toHaveProperty("image");
    expect(brandMark("Repsol")).toHaveProperty("image");
    expect(brandMark("PRIO")).toHaveProperty("image");
    expect(brandMark("Moeve")).toHaveProperty("image");
    expect(brandMark("CEPSA")).toHaveProperty("image");
    expect(brandMark("Alves Bandeira")).toHaveProperty("image");
    expect(brandMark("OZ Energia")).toHaveProperty("image");
    expect(brandMark("Plenergy")).toHaveProperty("image");
    expect(brandMark("Plenoil")).toHaveProperty("image");
    expect(brandMark("BP")).toHaveProperty("image");
    expect(brandMark("Genérico")).toBeUndefined();
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

  it("shows only the active fuel in price modes and all configured fuels in nearest mode", () => {
    const configured = ["diesel", "gasoline95", "dieselprime", "gasolineprime", "gplauto"] as const;
    expect(displayedFuels([...configured], "diesel")).toEqual(["diesel"]);
    expect(displayedFuels([...configured], "gasoline95")).toEqual(["gasoline95"]);
    expect(displayedFuels([...configured], "gplauto")).toEqual(["gplauto"]);
    expect(displayedFuels([...configured], "distance")).toEqual([...configured]);
  });

  it("assigns relative price levels", () => {
    expect(priceLevel(1, [1, 2, 3])).toBe("low");
    expect(priceLevel(3, [1, 2, 3])).toBe("high");
  });

  it("estimates total fuel cost and rounds the difference to cents", () => {
    expect(fuelEstimate(1.734, [1.7, 1.734], 30)).toEqual({ total: 52.02, difference: 1.02 });
    expect(fuelEstimate(1.7, [1.7, 1.734], 30)).toEqual({ total: 51, difference: 0 });
  });
});
