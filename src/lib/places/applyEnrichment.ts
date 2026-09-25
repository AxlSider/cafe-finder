import { prisma } from "@/lib/prisma";
import { getEnrichmentProvider } from "./enrichment";

export type EnrichOutcome =
  | { ok: true; matched: true; ratingSource: "Google" | "Foursquare" }
  | { ok: true; matched: false } // provider ran but found no match
  | { ok: false; reason: "no_provider" | "not_found" | "error" };

/**
 * Enrich one cafe from the configured external provider and persist the result.
 * Marks source=EXTERNAL and stamps lastSyncedAt. Photos are stored as a proxy
 * URL (/api/places/photo/[id]) so we never copy Google's image bytes to disk.
 */
export async function enrichCafe(cafeId: string): Promise<EnrichOutcome> {
  const provider = getEnrichmentProvider();
  if (!provider) return { ok: false, reason: "no_provider" };

  const cafe = await prisma.cafe.findUnique({ where: { id: cafeId } });
  if (!cafe) return { ok: false, reason: "not_found" };

  let result;
  try {
    result = await provider.enrich({
      name: cafe.name,
      locality: cafe.locality,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      googlePlaceId: cafe.googlePlaceId,
    });
  } catch {
    return { ok: false, reason: "error" };
  }
  if (!result) return { ok: true, matched: false };

  // Photo precedence: keep admin uploads; else a direct provider URL
  // (Foursquare); else Google's proxied photo; else whatever we had.
  const adminPhoto = cafe.photoUrl?.startsWith("/uploads");
  const newPhotoUrl = adminPhoto
    ? cafe.photoUrl
    : result.photoUrl
      ? result.photoUrl
      : result.googlePhotoName
        ? `/api/places/photo/${cafe.id}`
        : cafe.photoUrl;
  const newPhotoAttribution = adminPhoto
    ? cafe.photoAttribution
    : result.photoUrl || result.googlePhotoName
      ? result.provider
      : cafe.photoAttribution;

  await prisma.cafe.update({
    where: { id: cafe.id },
    data: {
      rating: result.rating,
      reviewCount: result.reviewCount,
      priceLevel: result.priceLevel ?? cafe.priceLevel,
      website: result.website ?? cafe.website,
      phone: result.phone ?? cafe.phone,
      ratingSource: result.ratingSource,
      // Keep the OSM/Google id if the provider didn't supply a Google one.
      googlePlaceId: result.googlePlaceId ?? cafe.googlePlaceId,
      googlePhotoName: result.googlePhotoName,
      photoUrl: newPhotoUrl,
      photoAttribution: newPhotoAttribution,
      source: "EXTERNAL",
      sourceName: result.provider,
      lastSyncedAt: new Date(),
    },
  });

  // Refresh opening hours from the provider when present.
  if (result.hours.length > 0) {
    await prisma.cafeHour.deleteMany({ where: { cafeId: cafe.id } });
    await prisma.cafeHour.createMany({
      data: result.hours.map((h) => ({
        cafeId: cafe.id,
        weekday: h.weekday,
        opensMin: h.opensMin,
        closesMin: h.closesMin,
      })),
      skipDuplicates: true,
    });
  }

  return { ok: true, matched: true, ratingSource: result.ratingSource };
}
