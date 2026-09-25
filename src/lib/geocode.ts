import { regionForCoords, type LatLng, type Region } from "@/lib/geo";

/**
 * Geocoding via OpenStreetMap Nominatim (default provider).
 * Runs SERVER-SIDE only so the required descriptive User-Agent and the
 * 1 req/sec usage policy stay on our side, never in the client.
 * See docs/DATA-SOURCES.md and docs/LOCATION.md.
 */

const BASE = process.env.GEOCODER_BASE_URL ?? "https://nominatim.openstreetmap.org";
// Nominatim rejects placeholder/fake-email User-Agents with 403. Use a real,
// descriptive UA per their usage policy: an app name + a contact URL/email.
const UA =
  process.env.GEOCODER_USER_AGENT ?? "CafeFinder/0.1 (+http://localhost:3000)";

export interface GeoResult {
  label: string;
  locality: string;
  location: LatLng;
  region: Region | null;
}

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

function localityOf(item: NominatimItem): string {
  const a = item.address ?? {};
  return (
    a.city ??
    a.town ??
    a.village ??
    a.municipality ??
    a.suburb ??
    a.county ??
    a.state ??
    item.display_name.split(",")[0] ??
    "Unknown area"
  );
}

/** Manual location search, restricted to PH + CH. */
export async function searchLocations(query: string): Promise<GeoResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(`${BASE}/search`);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  // Coverage countries only (Philippines, Switzerland).
  url.searchParams.set("countrycodes", "ph,ch");

  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en" },
    // Cache identical lookups briefly to respect the usage policy.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Geocoder search failed: ${res.status}`);

  const items = (await res.json()) as NominatimItem[];
  return items
    .map((item) => {
      const location = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
      return {
        label: item.display_name,
        locality: localityOf(item),
        location,
        region: regionForCoords(location),
      };
    })
    // Keep only results inside supported coverage.
    .filter((r) => r.region !== null);
}

/** Reverse geocode device coordinates to a human locality. */
export async function reverseGeocode(point: LatLng): Promise<GeoResult | null> {
  const url = new URL(`${BASE}/reverse`);
  url.searchParams.set("lat", String(point.lat));
  url.searchParams.set("lon", String(point.lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const item = (await res.json()) as NominatimItem;
  if (!item?.lat) return null;
  const location = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
  return {
    label: item.display_name,
    locality: localityOf(item),
    location: point, // keep the precise device coordinates
    region: regionForCoords(point),
  };
}
