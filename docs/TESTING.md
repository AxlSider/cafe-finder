# Testing

## Tooling
- **Vitest** for unit tests (`npm test`). Config: `vitest.config.ts` (`@` alias,
  node environment).
- **`tsc --noEmit`** (`npm run typecheck`) and **`next build`** act as
  type/integration gates.

## Current unit coverage
| File | What it verifies |
|---|---|
| `src/lib/geo.test.ts` | Coverage detection (Baguio→LUZON, Zürich→CH, Tokyo & Davao rejected), haversine distances, distance formatting |
| `src/lib/hours.test.ts` | `isOpenNow`: unknown → undefined, in/out of window, past-midnight window |
| `src/lib/drinks/recommend.test.ts` | Drink recommender: sweet+milk ranking, black-coffee exclusion, iced filter, matcha category, reasons |

16 tests passing.

## Manually verified
- App startup; home renders the location intro.
- Manual location search (Baguio) → live Nominatim result.
- Nearby API in-coverage (distance-sorted) and out-of-coverage (rejected).
- Cafe detail renders with honest "unavailable" states.
- Report submission returns `201`; appears in the admin reports queue.
- Guest save via localStorage; server-backed save when logged in.
- Admin login → dashboard; admin API returns 403 when unauthenticated.
- Drink recommender (`/order`) and cafe recommender (`/where`) return
  explainable results.
- Analytics events captured and aggregated on the admin dashboard.

## Critical flows that must always work
1. Location intro → permission/denied paths.
2. Manual location search restricted to coverage.
3. In-coverage vs out-of-coverage handling.
4. Nearby search + list/map render.
5. Cafe detail with missing data.
6. Report submission.

## Planned tests
- API route tests (Zod validation, coverage rejection) via Vitest + a test DB.
- Ranking tests (`ranking.ts`) for sort order & reasons.
- E2E (Playwright) for the core loop, including geolocation mocking.
- Auth/admin tests once those land.
