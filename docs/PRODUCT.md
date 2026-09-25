# Product

## Purpose
CupScout is a **location-first coffee discovery platform**. It removes the
friction between "I want coffee" and "I'm sitting down with the right drink at
the right place."

## Target users
- People out and about who want a good cafe **near them right now**.
- Students / remote workers choosing a place to study or work.
- People on a date or meeting friends who want the right *vibe*.
- Visitors to Luzon or Switzerland exploring local coffee.

There are **no business/merchant users**. The only privileged role is a single
platform **admin** who curates data and handles reports.

## Geographic scope
**Luzon (Philippines) and Switzerland only.** This is enforced in code
(`src/lib/geo.ts`), not just messaging. Out-of-coverage locations get:
> "CupScout currently covers Luzon and Switzerland."

No country switcher; discovery is driven by device location (with manual search
fallback).

## Core user problem
Existing tools answer "list of cafes" but not the two decisions people actually
make:
1. **Where should I go?** (given distance, vibe, hours, budget)
2. **What should I get?** (given taste preferences)

## Core loop
```
I WANT COFFEE
  → SEARCH / DISCOVER (location or manual)
  → LIST / MAP
  → CAFE DETAILS
  → WHERE SHOULD I GO?  (cafe recommendation)
  → WHAT SHOULD I GET?  (drink recommendation)
  → DIRECTIONS
  → SAVE
```

## Product principles
1. **Honest over impressive.** Never fabricate data to look complete.
2. **Location-first, permission-respectful.** Explain before asking.
3. **Explainable recommendations.** Always show *why*.
4. **Guest-friendly.** Browsing never requires an account.
5. **Graceful under missing data.** Every screen works without perfect data.

## Explicit non-goals
- Not a global directory (coverage is intentionally narrow).
- Not a turn-by-turn navigation engine (we hand off to a maps app).
- Not a review platform (we don't collect or invent reviews).
- No merchant/owner accounts, subscriptions, or ads.
