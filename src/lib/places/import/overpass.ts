import { regionForCoords, type Region } from "@/lib/geo";

/**
 * OpenStreetMap import via the Overpass API.
 *
 * Pulls REAL cafes (amenity=cafe) for an area — free, no key, ODbL-licensed.
 * We map only fields OSM actually provides (name, coords, website, phone, some
 * amenities, opening hours). OSM has NO ratings, so ratings stay unavailable —
 * this adds density honestly, never fabricated data. Attribution: OpenStreetMap.
 */

const OVERPASS_URL =
  process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";

export interface ImportedCafe {
  externalPlaceId: string; // "osm:node/123"
  name: string;
  region: Region;
  locality: string;
  latitude: number;
  longitude: number;
  address: string | null;
  website: string | null;
  phone: string | null;
  photoUrl: string | null; // free real photo (Wikimedia/OSM image tag), when present
  photoAttribution: string | null;
  amenities: string[]; // our keys: wifi, outdoor, outlets
  tags: string[]; // our keys: specialty (only when clearly indicated)
  hours: { weekday: number; opensMin: number; closesMin: number }[];
}

/**
 * Free real photo from OSM tags — no key, no cost:
 *  - `wikimedia_commons=File:Name.jpg` → Wikimedia Special:FilePath (reliable).
 *  - `image=<https…jpg|png|webp>` → the direct image URL (https only).
 * Returns null otherwise (we keep the branded placeholder). Attributed.
 */
function extractPhoto(
  tags: Record<string, string>,
): { url: string; attribution: string } | null {
  const commons = tags["wikimedia_commons"];
  if (commons?.startsWith("File:")) {
    const file = commons.slice("File:".length);
    return {
      url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`,
      attribution: "Wikimedia Commons",
    };
  }
  const image = tags["image"];
  if (image && /^https:\/\/.+\.(jpe?g|png|webp)(\?.*)?$/i.test(image)) {
    return { url: image, attribution: "OpenStreetMap contributor" };
  }
  return null;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * POST a query to Overpass with resilience: the public instance requires a
 * descriptive User-Agent (406 without one), rate-limits (429), overloads (504),
 * and sometimes returns 200 with a "runtime error … timed out" remark. We retry
 * with backoff, honoring Retry-After.
 */
async function overpassRequest(
  query: string,
  attempts = 6,
): Promise<OverpassResponse> {
  const ua = process.env.OVERPASS_USER_AGENT ?? "CupScout/1.0 (+https://cupscout.app)";
  let lastErr = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": ua,
        },
        body: new URLSearchParams({ data: query }).toString(),
      });

      if (res.status === 429 || res.status === 504 || res.status === 502) {
        lastErr = `status ${res.status}`;
        const retryAfter = Number(res.headers.get("retry-after"));
        await sleep(retryAfter > 0 ? retryAfter * 1000 : 3000 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`Overpass request failed: ${res.status}`);

      const data = (await res.json()) as OverpassResponse;
      // A 200 with no elements is almost always transient throttling/overload
      // for a city-sized query (empty body, sometimes with a "busy" remark).
      // Retry rather than accept a false empty — but return empty on the last try.
      if ((!data.elements || data.elements.length === 0) && i < attempts - 1) {
        lastErr = data.remark ?? "empty result (throttled)";
        await sleep(5000 * (i + 1));
        continue;
      }
      return data;
    } catch (e) {
      lastErr = (e as Error).message;
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error(`Overpass unavailable after ${attempts} attempts (${lastErr})`);
}

function pick(tags: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) if (tags[k]) return tags[k]!;
  return null;
}

const DAY: Record<string, number> = {
  Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6,
};
const DAY_ORDER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Conservative opening_hours parser. Handles "24/7" and simple rules like
 * "Mo-Fr 08:00-18:00; Sa 09:00-17:00" or "Mo,We,Fr 07:00-15:00". Anything it is
 * not confident about (PH, comments, multiple time spans, "off", etc.) is
 * skipped — we never guess hours.
 */
export function parseOpeningHours(
  raw: string | null,
): ImportedCafe["hours"] {
  if (!raw) return [];
  const s = raw.trim();
  if (s === "24/7") {
    return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensMin: 0, closesMin: 1440 }));
  }
  const out: ImportedCafe["hours"] = [];
  const rules = s.split(";").map((r) => r.trim()).filter(Boolean);
  for (const rule of rules) {
    // e.g. "Mo-Fr 08:00-18:00"  or "Mo,We 07:00-15:00"
    const m = rule.match(
      /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/,
    );
    if (!m) return []; // unknown format anywhere -> don't risk wrong hours
    const [, dayspec, oh, om, ch, cm] = m;
    const opensMin = parseInt(oh!, 10) * 60 + parseInt(om!, 10);
    let closesMin = parseInt(ch!, 10) * 60 + parseInt(cm!, 10);
    if (closesMin <= opensMin) closesMin += 24 * 60; // past-midnight
    const days = new Set<number>();
    for (const part of dayspec!.split(",")) {
      const range = part.split("-").map((d) => d.trim());
      if (range.length === 1) {
        days.add(DAY[range[0]!]!);
      } else {
        let i = DAY_ORDER.indexOf(range[0]!);
        const end = DAY_ORDER.indexOf(range[1]!);
        // walk forward (wrap) until end inclusive
        for (let guard = 0; guard < 8; guard++) {
          days.add(DAY[DAY_ORDER[i]!]!);
          if (i === end) break;
          i = (i + 1) % 7;
        }
      }
    }
    for (const weekday of days) out.push({ weekday, opensMin, closesMin });
  }
  return out;
}

function mapAmenities(tags: Record<string, string>): string[] {
  const a: string[] = [];
  if (tags["internet_access"] === "wlan" || tags["wifi"] === "yes" || tags["internet_access"] === "yes")
    a.push("wifi");
  if (tags["outdoor_seating"] === "yes") a.push("outdoor");
  return a;
}

/** Fetch cafes within `radiusM` of a center point from Overpass. */
export async function fetchCafesFromOverpass(
  center: { lat: number; lng: number },
  radiusM: number,
  defaultLocality: string,
): Promise<ImportedCafe[]> {
  // `out center` includes geometry (lat/lon), which `out tags` omits.
  const query = `[out:json][timeout:25];
node[amenity=cafe](around:${radiusM},${center.lat},${center.lng});
out center 250;`;

  const data = await overpassRequest(query);

  const cafes: ImportedCafe[] = [];
  for (const el of data.elements ?? []) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null || !el.tags) continue;
    const name = el.tags["name"];
    if (!name) continue; // can't display an unnamed cafe
    const region = regionForCoords({ lat, lng: lon });
    if (!region) continue; // enforce coverage

    const addrParts = [
      el.tags["addr:housenumber"],
      el.tags["addr:street"],
    ].filter(Boolean).join(" ");
    const locality =
      pick(el.tags, ["addr:city", "addr:town", "addr:suburb", "addr:village"]) ??
      defaultLocality;

    cafes.push({
      externalPlaceId: `osm:${el.type}/${el.id}`,
      name,
      region,
      locality,
      latitude: lat,
      longitude: lon,
      address: addrParts || null,
      website: pick(el.tags, ["website", "contact:website"]),
      phone: pick(el.tags, ["phone", "contact:phone"]),
      photoUrl: extractPhoto(el.tags)?.url ?? null,
      photoAttribution: extractPhoto(el.tags)?.attribution ?? null,
      amenities: mapAmenities(el.tags),
      tags: el.tags["cuisine"]?.includes("coffee") ? ["specialty"] : [],
      hours: parseOpeningHours(el.tags["opening_hours"] ?? null),
    });
  }
  return cafes;
}
