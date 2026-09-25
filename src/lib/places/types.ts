import type { LatLng, Region } from "@/lib/geo";

/**
 * Provider-agnostic place types. Feature code depends only on these shapes,
 * never on a concrete provider. See docs/DATA-SOURCES.md for the rationale
 * behind this abstraction (swapping curated -> Google/Mapbox later).
 */

export type PriceLevel = "BUDGET" | "MODERATE" | "EXPENSIVE";
export type DataSource = "CURATED" | "EXTERNAL" | "USER";

export interface OpeningHour {
  weekday: number; // 0=Sun..6=Sat
  opensMin: number;
  closesMin: number;
}

export interface CafeSummary {
  id: string;
  slug: string;
  name: string;
  region: Region;
  locality: string;
  location: LatLng;
  rating: number | null; // null => unavailable (never fabricated)
  reviewCount: number | null;
  ratingSource: string | null; // e.g. "Google" — shown so it's clearly external
  priceLevel: PriceLevel | null;
  photoUrl: string | null;
  photoAlt: string | null;
  photoAttribution: string | null;
  tags: string[];
  amenities: string[];
  source: DataSource;
  sourceName: string | null;
  /** Populated when the query has an origin point. */
  distanceKm?: number;
  /** True/false when hours are known; undefined when hours are unknown. */
  openNow?: boolean;
}

export interface CafeDrink {
  id: string;
  name: string;
  category: string;
  price: number | null;
  currency: string | null;
  hotAvailable: boolean;
  icedAvailable: boolean;
  sweet: boolean;
  bitter: boolean;
  strong: boolean;
  light: boolean;
  milkBased: boolean;
}

export interface CafeDetail extends CafeSummary {
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  hours: OpeningHour[];
  drinks: CafeDrink[];
  ratingSource: string | null;
}

export interface NearbyQuery {
  origin?: LatLng;
  region?: Region;
  /** Free-text search across name / locality / tags. */
  q?: string;
  radiusKm?: number;
  openNow?: boolean;
  minRating?: number;
  priceLevels?: PriceLevel[];
  tags?: string[];
  amenities?: string[];
  sort?: "recommended" | "distance" | "rating" | "reviews" | "price";
  limit?: number;
}

export interface PlacesProvider {
  readonly name: string;
  searchNearby(query: NearbyQuery): Promise<CafeSummary[]>;
  getCafe(slugOrId: string, origin?: LatLng): Promise<CafeDetail | null>;
}
