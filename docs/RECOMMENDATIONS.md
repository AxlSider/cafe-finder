# Recommendations & Ranking

All ranking here is **transparent** — a documented weighted sum, no hidden ML.
Source of truth: `src/lib/places/ranking.ts`.

## Cafe ranking (the "Recommended" sort & "Where should I go?")
`scoreCafe(cafe, query)` computes a score in ~[0,1] from weighted factors.
**Missing data contributes a neutral 0 — never a fabricated guess.**

| Factor | Weight | How it's scored |
|---|---:|---|
| Distance | 0.35 | `1 - km/10`, clamped ≥ 0 (closer = higher) |
| Rating | 0.30 | `rating/5` (0 when rating unknown) |
| Open now | 0.15 | 1 if open, else 0 (0 when hours unknown) |
| Tag match | 0.15 | fraction of requested purpose tags matched |
| Price | 0.05 | budget 1.0 / moderate 0.6 / expensive 0.3 |

> Because the curated dataset currently has no ratings/hours, distance and tag
> match dominate in practice — which is honest given what we know.

## Explainability
`scoreCafe` also returns human `reasons` (e.g. "1.2 km away", "Open now",
'Matches "study"'). The UI surfaces these as ✓ chips so every recommendation
shows **why**. No unexplained numeric scores are shown to users.

## Sorting options
`sortCafes(cafes, query)` supports: `recommended` (default), `distance`,
`rating`, `reviews`, `price`. Records with missing values for a sort key sort
last rather than being dropped.

## Filters (applied before ranking)
Region, `minRating`, price levels, purpose tags, amenities, `radiusKm`,
`openNow`, and free-text `q`. See [API.md](API.md) for parameters.

## "Where should I go?" (intent-based)
Implemented today via the category chips on the home screen (Study, Work, Date,
Specialty, Budget, Open Late, Highly Rated, Open Now, Nearby), which set the
corresponding filter/sort and reuse the ranking above. A dedicated guided intent
screen is a planned enhancement.

## "What should I get?" (drink recommendation) — implemented (0.2.0)
Built in `src/lib/drinks/recommend.ts` (tested), API `/api/recommend/drinks`,
UI `/order`.
- Matches taste (sweet/bitter/strong/light), style (milk-based/black/matcha/tea/
  chocolate), and temperature (hot/iced) against a seeded **DrinkType** guide —
  **general coffee knowledge, not any cafe's menu or prices** (honest by design;
  see [DATA-SOURCES.md](DATA-SOURCES.md)).
- **Hard filters:** temperature availability; "black coffee" excludes milk-based.
- **Score** = matched attributes / requested attributes; ties broken by name.
- **Explainable:** returns reasons (✓ Sweet, ✓ Milk-based, ✓ Iced available).
- **Prefill:** signed-in users' saved coffee profile pre-selects the toggles.
- Per-cafe menus remain empty until a licensed menu source exists; the drink
  guide is deliberately separate so we never fabricate a cafe's menu.

## Missing-data behavior (summary)
Unknown rating/hours/price/menu never invents a value and never hard-penalizes;
it contributes neutrally to scoring and shows an honest "unavailable" in the UI.
