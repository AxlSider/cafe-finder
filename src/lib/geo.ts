/**
 * Geographic utilities and coverage enforcement.
 *
 * CupScout supports ONLY Luzon (Philippines) and Switzerland.
 * Coverage is enforced here (data layer), then reused by APIs and UI so the
 * restriction is not merely cosmetic. See docs/LOCATION.md.
 */

export type Region = "LUZON" | "SWITZERLAND";

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Approximate bounding boxes. These intentionally err slightly generous at the
 * edges; final authority for a cafe's region is its stored `region` column.
 * Luzon = the northern island group of the Philippines (incl. Metro Manila,
 * Cordillera, Central/ Southern Luzon, Bicol).
 */
export const REGION_BOUNDS: Record<
  Region,
  { minLat: number; maxLat: number; minLng: number; maxLng: number; label: string }
> = {
  LUZON: {
    minLat: 12.2,
    maxLat: 18.75,
    minLng: 119.3,
    maxLng: 124.6,
    label: "Luzon, Philippines",
  },
  SWITZERLAND: {
    minLat: 45.75,
    maxLat: 47.85,
    minLng: 5.85,
    maxLng: 10.55,
    label: "Switzerland",
  },
};

/** Returns the covered region for a coordinate, or null if out of coverage. */
export function regionForCoords(point: LatLng): Region | null {
  for (const region of Object.keys(REGION_BOUNDS) as Region[]) {
    const b = REGION_BOUNDS[region];
    if (
      point.lat >= b.minLat &&
      point.lat <= b.maxLat &&
      point.lng >= b.minLng &&
      point.lng <= b.maxLng
    ) {
      return region;
    }
  }
  return null;
}

export function isCovered(point: LatLng): boolean {
  return regionForCoords(point) !== null;
}

export const COVERAGE_MESSAGE =
  "CupScout currently covers Luzon and Switzerland.";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in kilometres (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Format a distance for display, e.g. "850 m" or "1.2 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
