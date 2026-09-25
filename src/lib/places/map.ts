import { haversineKm, type LatLng } from "@/lib/geo";
import { isOpenNow } from "@/lib/hours";
import type { CafeSummary, PriceLevel } from "./types";

/**
 * Maps a Prisma cafe row (with tags/amenities/hours included) to a provider-
 * agnostic CafeSummary. Shared by the curated provider and favorites API so the
 * shape stays consistent in one place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cafeRowToSummary(c: any, origin?: LatLng): CafeSummary {
  const location = { lat: c.latitude, lng: c.longitude };
  const hours = c.hours?.map((h: any) => ({
    weekday: h.weekday,
    opensMin: h.opensMin,
    closesMin: h.closesMin,
  }));
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    region: c.region,
    locality: c.locality,
    location,
    // Prefer an external/curated rating; otherwise surface the community
    // (user-generated) aggregate, clearly labeled "Community".
    rating:
      c.rating != null
        ? c.rating
        : c.communityRatingCount > 0
          ? c.communityRating
          : null,
    reviewCount:
      c.rating != null
        ? c.reviewCount
        : c.communityRatingCount > 0
          ? c.communityRatingCount
          : null,
    ratingSource:
      c.rating != null
        ? (c.ratingSource ?? null)
        : c.communityRatingCount > 0
          ? "Community"
          : null,
    priceLevel: c.priceLevel as PriceLevel | null,
    photoUrl: c.photoUrl,
    photoAlt: c.photoAlt,
    photoAttribution: c.photoAttribution ?? null,
    tags: (c.tags ?? []).map((t: any) => t.tag.key),
    amenities: (c.amenities ?? []).map((a: any) => a.amenity.key),
    source: c.source,
    sourceName: c.sourceName,
    distanceKm: origin ? haversineKm(origin, location) : undefined,
    openNow: isOpenNow(hours),
  };
}
