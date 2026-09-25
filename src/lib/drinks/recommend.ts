/**
 * "What should I order?" — transparent drink-type recommendation.
 *
 * Matches user preferences against GENERAL drink-type attributes (not any
 * specific cafe's menu — see docs/DATA-SOURCES.md / RECOMMENDATIONS.md).
 * Every recommendation carries human-readable reasons; no hidden scoring.
 */

export interface DrinkTypeLike {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  hotAvailable: boolean;
  icedAvailable: boolean;
  sweet: boolean;
  bitter: boolean;
  strong: boolean;
  light: boolean;
  milkBased: boolean;
  hasCaffeine: boolean;
}

export interface DrinkPreferences {
  sweet?: boolean;
  bitter?: boolean;
  strong?: boolean;
  light?: boolean;
  milkBased?: boolean;
  black?: boolean;
  matcha?: boolean;
  tea?: boolean;
  chocolate?: boolean;
  hot?: boolean;
  iced?: boolean;
}

export interface DrinkRecommendation {
  drink: DrinkTypeLike;
  score: number;
  reasons: string[];
}

const TASTE_LABELS: Record<string, string> = {
  sweet: "Sweet",
  bitter: "Bitter",
  strong: "Strong",
  light: "Light",
};

export function recommendDrinks(
  prefs: DrinkPreferences,
  drinks: DrinkTypeLike[],
): DrinkRecommendation[] {
  // Count how many preferences the user expressed (for normalization).
  const requested = Object.entries(prefs).filter(([, v]) => v).map(([k]) => k);
  const results: DrinkRecommendation[] = [];

  for (const drink of drinks) {
    // Hard temperature filter: can't serve what isn't available.
    if (prefs.hot && !drink.hotAvailable && !(prefs.iced && drink.icedAvailable)) continue;
    if (prefs.iced && !drink.icedAvailable && !(prefs.hot && drink.hotAvailable)) continue;
    // "Black coffee" excludes milk-based drinks.
    if (prefs.black && drink.milkBased) continue;

    let matched = 0;
    const reasons: string[] = [];

    for (const taste of ["sweet", "bitter", "strong", "light"] as const) {
      if (prefs[taste] && drink[taste]) {
        matched++;
        reasons.push(TASTE_LABELS[taste]!);
      }
    }
    if (prefs.milkBased && drink.milkBased) {
      matched++;
      reasons.push("Milk-based");
    }
    if (prefs.black && !drink.milkBased) {
      matched++;
      reasons.push("Black coffee");
    }
    if (prefs.matcha && drink.category === "MATCHA") {
      matched++;
      reasons.push("Matcha");
    }
    if (prefs.tea && drink.category === "TEA") {
      matched++;
      reasons.push("Tea");
    }
    if (prefs.chocolate && drink.category === "CHOCOLATE") {
      matched++;
      reasons.push("Chocolate");
    }
    if (prefs.iced && drink.icedAvailable) reasons.push("Iced available");
    if (prefs.hot && drink.hotAvailable) reasons.push("Hot available");

    // Skip drinks that match nothing the user asked for (when they asked for anything).
    if (requested.length > 0 && matched === 0 && !prefs.hot && !prefs.iced) continue;

    const denom = Math.max(
      1,
      requested.filter((r) => r !== "hot" && r !== "iced").length,
    );
    const score = matched / denom;
    results.push({ drink, score, reasons });
  }

  return results.sort((a, b) => b.score - a.score || a.drink.name.localeCompare(b.drink.name));
}
