import type { CafeSummary, NearbyQuery } from "./types";

/**
 * Transparent, explainable ranking for the "Recommended" sort and the
 * "Where should I go?" flow. No hidden ML — every factor is documented here
 * and mirrored in docs/RECOMMENDATIONS.md.
 *
 * Score is a weighted sum in [0, 1]-ish space; higher is better. Missing data
 * contributes a neutral 0 for that factor (never a penalty guess).
 */
export interface ScoredCafe {
  cafe: CafeSummary;
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  distance: 0.35,
  rating: 0.3,
  open: 0.15,
  tagMatch: 0.15,
  price: 0.05,
};

function distanceScore(km: number | undefined): number {
  if (km == null) return 0;
  // 0 km -> 1, 10 km -> ~0. Linear decay, clamped.
  return Math.max(0, 1 - km / 10);
}

function ratingScore(rating: number | null): number {
  if (rating == null) return 0;
  return Math.min(1, rating / 5);
}

export function scoreCafe(cafe: CafeSummary, query: NearbyQuery): ScoredCafe {
  const reasons: string[] = [];

  const dScore = distanceScore(cafe.distanceKm);
  if (cafe.distanceKm != null && cafe.distanceKm <= 3) {
    reasons.push(`${cafe.distanceKm.toFixed(1)} km away`);
  }

  const rScore = ratingScore(cafe.rating);
  if (cafe.rating != null && cafe.rating >= 4.3) {
    reasons.push(`${cafe.rating.toFixed(1)} rating`);
  }

  const oScore = cafe.openNow === true ? 1 : 0;
  if (cafe.openNow === true) reasons.push("Open now");

  const wantTags = query.tags ?? [];
  const matched = wantTags.filter((t) => cafe.tags.includes(t));
  const tScore = wantTags.length ? matched.length / wantTags.length : 0;
  for (const t of matched) reasons.push(`Matches "${t}"`);

  const pScore = cafe.priceLevel === "BUDGET" ? 1 : cafe.priceLevel === "MODERATE" ? 0.6 : 0.3;

  const score =
    dScore * WEIGHTS.distance +
    rScore * WEIGHTS.rating +
    oScore * WEIGHTS.open +
    tScore * WEIGHTS.tagMatch +
    pScore * WEIGHTS.price;

  return { cafe, score, reasons };
}

export function sortCafes(cafes: CafeSummary[], query: NearbyQuery): CafeSummary[] {
  const sort = query.sort ?? "recommended";
  const list = [...cafes];

  switch (sort) {
    case "distance":
      return list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    case "rating":
      return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "reviews":
      return list.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
    case "price": {
      const rank = { BUDGET: 0, MODERATE: 1, EXPENSIVE: 2 } as const;
      return list.sort(
        (a, b) =>
          (a.priceLevel ? rank[a.priceLevel] : 99) -
          (b.priceLevel ? rank[b.priceLevel] : 99),
      );
    }
    case "recommended":
    default:
      return list
        .map((c) => scoreCafe(c, query))
        .sort((a, b) => b.score - a.score)
        .map((s) => s.cafe);
  }
}
