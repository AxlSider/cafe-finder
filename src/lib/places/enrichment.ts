/**
 * External place ENRICHMENT (ratings, review counts, price, hours, photos).
 *
 * Two providers, both gated on their key (blank = inactive, no calls, no cost):
 *  - **Google Places (New)** — `GOOGLE_MAPS_API_KEY` (paid; needs billing).
 *  - **Foursquare Places** — `FOURSQUARE_API_KEY` (free tier; no credit card).
 *
 * Selection: `ENRICHMENT_PROVIDER` ("google" | "foursquare") forces one;
 * otherwise Google is used when its key is set, else Foursquare. If no key is
 * configured, `getEnrichmentProvider()` returns null and nothing is enriched
 * (ratings stay "unavailable" — no fabrication).
 *
 * Server-only by construction; imported by route handlers and `db:enrich`.
 */

export type PriceLevel = "BUDGET" | "MODERATE" | "EXPENSIVE";

export interface EnrichmentResult {
  provider: "Google" | "Foursquare";
  externalId: string; // place_id (Google) or fsq_id (Foursquare)
  rating: number | null; // normalized to 0–5
  reviewCount: number | null;
  priceLevel: PriceLevel | null;
  website: string | null;
  phone: string | null;
  /** A directly-usable image URL (Foursquare CDN), or null when the photo needs
   *  server-side proxying (Google — see googlePhotoName). */
  photoUrl: string | null;
  googlePlaceId: string | null; // set for Google (dedup/refresh)
  googlePhotoName: string | null; // set for Google (proxied via /api/places/photo)
  hours: { weekday: number; opensMin: number; closesMin: number }[];
  ratingSource: "Google" | "Foursquare";
}

export interface EnrichmentInput {
  name: string;
  locality: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string | null;
}

export interface EnrichmentProvider {
  readonly name: string;
  enrich(input: EnrichmentInput): Promise<EnrichmentResult | null>;
}

// ------------------------------------------------------------------
// Google Places (New)
// ------------------------------------------------------------------
const GOOGLE_PRICE: Record<string, PriceLevel> = {
  PRICE_LEVEL_INEXPENSIVE: "BUDGET",
  PRICE_LEVEL_MODERATE: "MODERATE",
  PRICE_LEVEL_EXPENSIVE: "EXPENSIVE",
  PRICE_LEVEL_VERY_EXPENSIVE: "EXPENSIVE",
};

const GOOGLE_DETAIL_FIELDS = [
  "id",
  "rating",
  "userRatingCount",
  "priceLevel",
  "websiteUri",
  "internationalPhoneNumber",
  "regularOpeningHours",
  "photos",
].join(",");

class GooglePlacesProvider implements EnrichmentProvider {
  readonly name = "google";
  constructor(private key: string) {}

  private async findPlaceId(input: EnrichmentInput): Promise<string | null> {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.key,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: `${input.name}, ${input.locality}`,
        maxResultCount: 1,
        locationBias: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: 500,
          },
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { places?: { id: string }[] };
    return data.places?.[0]?.id ?? null;
  }

  private normalizeHours(oh: unknown): EnrichmentResult["hours"] {
    const periods = (oh as { periods?: unknown[] } | undefined)?.periods;
    if (!Array.isArray(periods)) return [];
    const out: EnrichmentResult["hours"] = [];
    for (const p of periods as {
      open?: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }[]) {
      if (!p.open) continue;
      const opensMin = p.open.hour * 60 + p.open.minute;
      let closesMin = p.close ? p.close.hour * 60 + p.close.minute : 24 * 60;
      if (p.close && p.close.day !== p.open.day) closesMin += 24 * 60;
      out.push({ weekday: p.open.day, opensMin, closesMin });
    }
    return out;
  }

  async enrich(input: EnrichmentInput): Promise<EnrichmentResult | null> {
    const placeId = input.googlePlaceId ?? (await this.findPlaceId(input));
    if (!placeId) return null;

    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { "X-Goog-Api-Key": this.key, "X-Goog-FieldMask": GOOGLE_DETAIL_FIELDS },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      id: string;
      rating?: number;
      userRatingCount?: number;
      priceLevel?: string;
      websiteUri?: string;
      internationalPhoneNumber?: string;
      regularOpeningHours?: unknown;
      photos?: { name: string }[];
    };

    return {
      provider: "Google",
      externalId: d.id ?? placeId,
      rating: d.rating ?? null,
      reviewCount: d.userRatingCount ?? null,
      priceLevel: d.priceLevel ? (GOOGLE_PRICE[d.priceLevel] ?? null) : null,
      website: d.websiteUri ?? null,
      phone: d.internationalPhoneNumber ?? null,
      photoUrl: null, // proxied via googlePhotoName
      googlePlaceId: d.id ?? placeId,
      googlePhotoName: d.photos?.[0]?.name ?? null,
      hours: this.normalizeHours(d.regularOpeningHours),
      ratingSource: "Google",
    };
  }
}

// ------------------------------------------------------------------
// Foursquare Places (2025 Places API)
// Base: places-api.foursquare.com, auth: `Authorization: Bearer <key>` +
// `X-Places-Api-Version`. NOTE (verified against a live free key): search and
// core fields are free, but rating/photos/hours are **Premium** and return HTTP
// 429 "no API credits remaining" until the account has credits/billing. We
// handle that gracefully (return null, no crash). See docs/DATA-SOURCES.md.
// ------------------------------------------------------------------
const FSQ_BASE = "https://places-api.foursquare.com";

class FoursquareProvider implements EnrichmentProvider {
  readonly name = "foursquare";
  constructor(private key: string) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.key}`,
      "X-Places-Api-Version":
        process.env.FOURSQUARE_API_VERSION ?? "2025-06-17",
      Accept: "application/json",
    };
  }

  private async findId(input: EnrichmentInput): Promise<string | null> {
    const url = new URL(`${FSQ_BASE}/places/search`);
    url.searchParams.set("query", input.name);
    url.searchParams.set("ll", `${input.latitude},${input.longitude}`);
    url.searchParams.set("radius", "500");
    url.searchParams.set("limit", "1");
    url.searchParams.set("fields", "fsq_place_id");
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { fsq_place_id: string }[] };
    return data.results?.[0]?.fsq_place_id ?? null;
  }

  private normalizeHours(hours: unknown): EnrichmentResult["hours"] {
    const regular = (hours as { regular?: unknown[] } | undefined)?.regular;
    if (!Array.isArray(regular)) return [];
    const out: EnrichmentResult["hours"] = [];
    for (const r of regular as { day?: number; open?: string; close?: string }[]) {
      if (r.day == null || !r.open || !r.close) continue;
      const weekday = r.day === 7 ? 0 : r.day; // FSQ 1(Mon)..7(Sun) -> our 0=Sun
      const opensMin = parseInt(r.open.slice(0, 2), 10) * 60 + parseInt(r.open.slice(2), 10);
      let closesMin = parseInt(r.close.slice(0, 2), 10) * 60 + parseInt(r.close.slice(2), 10);
      if (closesMin <= opensMin) closesMin += 24 * 60;
      out.push({ weekday, opensMin, closesMin });
    }
    return out;
  }

  private photoUrl(photos: unknown): string | null {
    const first = Array.isArray(photos) ? photos[0] : null;
    if (!first) return null;
    if (typeof first === "string") return first;
    const p = first as { prefix?: string; suffix?: string };
    return p.prefix && p.suffix ? `${p.prefix}original${p.suffix}` : null;
  }

  async enrich(input: EnrichmentInput): Promise<EnrichmentResult | null> {
    const id = await this.findId(input);
    if (!id) return null;

    const url = new URL(`${FSQ_BASE}/places/${id}`);
    url.searchParams.set(
      "fields",
      "fsq_place_id,rating,price,website,tel,hours,photos",
    );
    const res = await fetch(url, { headers: this.headers() });
    // 429 = premium fields need credits (free tier exhausted). Not an error we
    // want to crash on — there's simply nothing to enrich.
    if (!res.ok) return null;
    const d = (await res.json()) as {
      fsq_place_id?: string;
      rating?: number; // 0–10
      price?: number; // 1–4
      website?: string;
      tel?: string;
      hours?: unknown;
      photos?: unknown;
    };

    const priceMap: Record<number, PriceLevel> = { 1: "BUDGET", 2: "MODERATE", 3: "EXPENSIVE", 4: "EXPENSIVE" };
    const rating = d.rating != null ? Math.round((d.rating / 2) * 10) / 10 : null; // 0–10 -> 0–5

    // If none of the premium fields came back, treat as no match (nothing to add).
    if (rating == null && !d.photos && !d.website && !d.hours) return null;

    return {
      provider: "Foursquare",
      externalId: d.fsq_place_id ?? id,
      rating,
      reviewCount: null, // review count is a separate premium field; omit for now
      priceLevel: d.price ? (priceMap[d.price] ?? null) : null,
      website: d.website ?? null,
      phone: d.tel ?? null,
      photoUrl: this.photoUrl(d.photos),
      googlePlaceId: null,
      googlePhotoName: null,
      hours: this.normalizeHours(d.hours),
      ratingSource: "Foursquare",
    };
  }
}

// ------------------------------------------------------------------
// Selection
// ------------------------------------------------------------------
export function getEnrichmentProvider(): EnrichmentProvider | null {
  const forced = process.env.ENRICHMENT_PROVIDER?.trim().toLowerCase();
  const google = process.env.GOOGLE_MAPS_API_KEY?.trim();
  const foursquare = process.env.FOURSQUARE_API_KEY?.trim();

  if (forced === "google") return google ? new GooglePlacesProvider(google) : null;
  if (forced === "foursquare") return foursquare ? new FoursquareProvider(foursquare) : null;

  if (google) return new GooglePlacesProvider(google);
  if (foursquare) return new FoursquareProvider(foursquare);
  return null;
}

/** Resolves a Google Places photo to a keyless, client-safe image URL. */
export async function resolveGooglePhotoUri(
  photoName: string,
  maxWidthPx = 800,
): Promise<string | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true&key=${key}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { photoUri?: string };
    return data.photoUri ?? null;
  } catch {
    return null;
  }
}
