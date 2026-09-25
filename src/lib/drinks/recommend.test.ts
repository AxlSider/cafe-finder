import { describe, it, expect } from "vitest";
import { recommendDrinks, type DrinkTypeLike } from "./recommend";

const make = (over: Partial<DrinkTypeLike>): DrinkTypeLike => ({
  id: over.slug ?? "x",
  slug: over.slug ?? "x",
  name: over.name ?? "X",
  category: over.category ?? "COFFEE",
  description: "",
  hotAvailable: true,
  icedAvailable: false,
  sweet: false,
  bitter: false,
  strong: false,
  light: false,
  milkBased: false,
  hasCaffeine: true,
  ...over,
});

const drinks: DrinkTypeLike[] = [
  make({ slug: "espresso", name: "Espresso", strong: true, bitter: true }),
  make({ slug: "spanish-latte", name: "Spanish Latte", sweet: true, milkBased: true, icedAvailable: true, category: "LATTE" }),
  make({ slug: "cold-brew", name: "Cold Brew", strong: true, icedAvailable: true, hotAvailable: false, category: "COLD_COFFEE" }),
  make({ slug: "matcha-latte", name: "Matcha Latte", milkBased: true, sweet: true, icedAvailable: true, category: "MATCHA" }),
];

describe("recommendDrinks", () => {
  it("ranks sweet + milk-based drinks top, each with matching reasons", () => {
    const recs = recommendDrinks({ sweet: true, milkBased: true }, drinks);
    // Spanish Latte and Matcha Latte both match fully (tie broken by name).
    const top = recs[0]!;
    expect(top.drink.sweet && top.drink.milkBased).toBe(true);
    expect(top.reasons).toEqual(expect.arrayContaining(["Sweet", "Milk-based"]));
    // The non-matching Espresso must not outrank a full match.
    expect(recs.map((r) => r.drink.slug).slice(0, 2)).toEqual(
      expect.arrayContaining(["spanish-latte", "matcha-latte"]),
    );
  });

  it("excludes milk-based drinks when 'black coffee' is chosen", () => {
    const recs = recommendDrinks({ black: true }, drinks);
    const slugs = recs.map((r) => r.drink.slug);
    expect(slugs).not.toContain("spanish-latte");
    expect(slugs).not.toContain("matcha-latte");
  });

  it("filters out hot-only drinks when iced is required", () => {
    // Espresso is hot-only; asking for iced should drop it.
    const recs = recommendDrinks({ iced: true }, drinks);
    expect(recs.map((r) => r.drink.slug)).not.toContain("espresso");
  });

  it("matches matcha by category", () => {
    const recs = recommendDrinks({ matcha: true }, drinks);
    expect(recs[0]!.drink.slug).toBe("matcha-latte");
    expect(recs[0]!.reasons).toContain("Matcha");
  });
});
