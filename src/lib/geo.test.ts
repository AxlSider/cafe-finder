import { describe, it, expect } from "vitest";
import {
  haversineKm,
  regionForCoords,
  isCovered,
  formatDistance,
} from "./geo";

describe("geo coverage", () => {
  it("places Baguio in LUZON", () => {
    expect(regionForCoords({ lat: 16.4023, lng: 120.596 })).toBe("LUZON");
  });

  it("places Zürich in SWITZERLAND", () => {
    expect(regionForCoords({ lat: 47.3769, lng: 8.5417 })).toBe("SWITZERLAND");
  });

  it("rejects Tokyo (out of coverage)", () => {
    expect(regionForCoords({ lat: 35.6762, lng: 139.6503 })).toBeNull();
    expect(isCovered({ lat: 35.6762, lng: 139.6503 })).toBe(false);
  });

  it("rejects Mindanao / Davao (PH but not Luzon)", () => {
    expect(regionForCoords({ lat: 7.1907, lng: 125.4553 })).toBeNull();
  });
});

describe("haversineKm", () => {
  it("returns ~0 for identical points", () => {
    const p = { lat: 16.4, lng: 120.6 };
    expect(haversineKm(p, p)).toBeCloseTo(0, 5);
  });

  it("approximates Zürich → Geneva (~224 km)", () => {
    const zurich = { lat: 47.3769, lng: 8.5417 };
    const geneva = { lat: 46.2044, lng: 6.1432 };
    const d = haversineKm(zurich, geneva);
    expect(d).toBeGreaterThan(200);
    expect(d).toBeLessThan(250);
  });
});

describe("formatDistance", () => {
  it("uses metres under 1 km", () => {
    expect(formatDistance(0.85)).toBe("850 m");
  });
  it("uses km at/over 1 km", () => {
    expect(formatDistance(1.234)).toBe("1.2 km");
  });
});
