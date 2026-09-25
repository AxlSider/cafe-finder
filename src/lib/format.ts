import type { PriceLevel } from "@/lib/places/types";

export function priceLevelLabel(level: PriceLevel | null): string {
  switch (level) {
    case "BUDGET":
      return "$";
    case "MODERATE":
      return "$$";
    case "EXPENSIVE":
      return "$$$";
    default:
      return "";
  }
}

export function priceLevelWords(level: PriceLevel | null): string {
  switch (level) {
    case "BUDGET":
      return "Budget-friendly";
    case "MODERATE":
      return "Moderate";
    case "EXPENSIVE":
      return "Expensive";
    default:
      return "Price unavailable";
  }
}

export function formatMoney(price: number | null, currency: string | null): string {
  if (price == null) return "Price unavailable";
  const symbol = currency === "PHP" ? "₱" : currency === "CHF" ? "CHF " : "";
  return `${symbol}${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

export function ratingLabel(rating: number | null, reviewCount: number | null): string {
  if (rating == null) return "Rating unavailable";
  const reviews = reviewCount != null ? ` (${reviewCount})` : "";
  return `${rating.toFixed(1)}${reviews}`;
}
