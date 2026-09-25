import { prisma } from "@/lib/prisma";
import { type LatLng } from "@/lib/geo";
import { sortCafes } from "./ranking";
import { cafeRowToSummary } from "./map";
import type {
  CafeDetail,
  CafeSummary,
  NearbyQuery,
  PlacesProvider,
} from "./types";

/**
 * Curated provider — reads the locally-seeded, Cafe-Finder-owned dataset.
 * This is the default, free, offline-capable source. All records are marked
 * source=CURATED and carry no fabricated ratings/hours.
 */
class CuratedPlacesProvider implements PlacesProvider {
  readonly name = "curated";

  async searchNearby(query: NearbyQuery): Promise<CafeSummary[]> {
    // When we have an origin + radius, constrain candidates to a geographic
    // bounding box IN THE DATABASE (uses the (latitude, longitude) index).
    // Without this, `take` would cap candidates to an arbitrary subset before
    // distance filtering, so cafes outside that subset (e.g. a city imported
    // later) would never be found. Exact haversine filtering happens after.
    let bbox = {};
    let bounded = false;
    if (query.origin && query.radiusKm) {
      const { lat, lng } = query.origin;
      // Pad the box slightly so cafes near the edge aren't clipped by rounding.
      const dLat = query.radiusKm / 111 + 0.02;
      const dLng =
        query.radiusKm / (111 * Math.max(0.2, Math.cos((lat * Math.PI) / 180))) + 0.02;
      bbox = {
        latitude: { gte: lat - dLat, lte: lat + dLat },
        longitude: { gte: lng - dLng, lte: lng + dLng },
      };
      bounded = true;
    }

    const cafes = await prisma.cafe.findMany({
      where: {
        ...bbox,
        ...(query.region ? { region: query.region } : {}),
        ...(query.minRating != null ? { rating: { gte: query.minRating } } : {}),
        ...(query.priceLevels?.length
          ? { priceLevel: { in: query.priceLevels } }
          : {}),
        ...(query.q
          ? {
              OR: [
                { name: { contains: query.q } },
                { locality: { contains: query.q } },
                { tags: { some: { tag: { label: { contains: query.q } } } } },
              ],
            }
          : {}),
        ...(query.tags?.length
          ? { tags: { some: { tag: { key: { in: query.tags } } } } }
          : {}),
        ...(query.amenities?.length
          ? { amenities: { some: { amenity: { key: { in: query.amenities } } } } }
          : {}),
      },
      include: {
        hours: true,
        tags: { include: { tag: true } },
        amenities: { include: { amenity: true } },
      },
      take: bounded ? 500 : 200,
    });

    let summaries: CafeSummary[] = cafes.map((c) =>
      cafeRowToSummary(c, query.origin),
    );

    if (query.origin && query.radiusKm) {
      summaries = summaries.filter(
        (s) => (s.distanceKm ?? Infinity) <= query.radiusKm!,
      );
    }
    if (query.openNow) {
      summaries = summaries.filter((s) => s.openNow === true);
    }

    const sorted = sortCafes(summaries, query);
    return query.limit ? sorted.slice(0, query.limit) : sorted;
  }

  async getCafe(slugOrId: string, origin?: LatLng): Promise<CafeDetail | null> {
    const cafe = await prisma.cafe.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: {
        hours: { orderBy: [{ weekday: "asc" }, { opensMin: "asc" }] },
        tags: { include: { tag: true } },
        amenities: { include: { amenity: true } },
        drinks: { orderBy: { name: "asc" } },
      },
    });
    if (!cafe) return null;

    const summary = cafeRowToSummary(cafe, origin);
    return {
      ...summary,
      address: cafe.address,
      phone: cafe.phone,
      website: cafe.website,
      description: cafe.description,
      // ratingSource comes from ...summary now
      hours: cafe.hours.map((h) => ({
        weekday: h.weekday,
        opensMin: h.opensMin,
        closesMin: h.closesMin,
      })),
      drinks: cafe.drinks.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        price: d.price,
        currency: d.currency,
        hotAvailable: d.hotAvailable,
        icedAvailable: d.icedAvailable,
        sweet: d.sweet,
        bitter: d.bitter,
        strong: d.strong,
        light: d.light,
        milkBased: d.milkBased,
      })),
    };
  }

}

export const curatedProvider = new CuratedPlacesProvider();
