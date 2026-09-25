# Internal API

All endpoints are Next.js route handlers under `src/app/api`. Input is validated
with Zod; invalid input returns `400 { error, details }`.

---

## `GET /api/cafes/nearby`
Search/discover cafes. Enforces geographic coverage.

**Query params** (all optional):
| Param | Type | Notes |
|---|---|---|
| `lat`, `lng` | number | Origin; enables distance + coverage check |
| `region` | `LUZON`\|`SWITZERLAND` | Explicit region filter |
| `q` | string | Free text (name / locality / tag) |
| `radiusKm` | number ≤ 50 | Requires origin |
| `openNow` | `true`\|`false` | Keeps only currently-open cafes |
| `minRating` | 0–5 | |
| `price` | csv of `BUDGET,MODERATE,EXPENSIVE` | |
| `tags` | csv of tag keys | e.g. `study,work` |
| `amenities` | csv of amenity keys | e.g. `wifi,outlets` |
| `sort` | `recommended`\|`distance`\|`rating`\|`reviews`\|`price` | default `recommended` |
| `limit` | int ≤ 100 | |

**Responses:**
- `200 { covered: true, cafes: CafeSummary[] }`
- `200 { covered: false, error, cafes: [] }` — origin outside coverage
- `400 { error, details }` — invalid params
- `500 { error }`

---

## `GET /api/geocode`
Geocoding proxy (server-side Nominatim). Provide **either** `q` or `lat`+`lng`.

- `?q=<text>` → `200 { results: GeoResult[] }` (restricted to PH+CH, filtered to
  coverage).
- `?lat=&lng=` → `200 { result: GeoResult, covered: true }` or
  `200 { result: null, covered: false, message }`.
- `400 { error }` invalid · `502 { error }` upstream geocoder failure.

`GeoResult = { label, locality, location:{lat,lng}, region }`.

---

## `POST /api/reports`
Submit a correction about a cafe (guest-allowed).

**Body:** `{ cafeId: string (id or slug), kind: ReportKind, details?: string }`
where `ReportKind ∈ {WRONG_LOCATION, WRONG_HOURS, CLOSED, DUPLICATE, WRONG_MENU,
WRONG_INFO, WRONG_PHOTO}`.

**Responses:** `201 { ok: true }` · `400 { error, details }` ·
`404 { error }` (cafe not found).

---

## Types
Response shapes (`CafeSummary`, `CafeDetail`, `CafeDrink`, `GeoResult`) are
defined in `src/lib/places/types.ts` and `src/lib/geocode.ts`.

## Auth (`/api/auth/*`)
- `POST /register` `{ email, password(≥8), displayName? }` → `201 { user }` /
  `409` (email taken). Sets session cookie.
- `POST /login` `{ email, password }` → `200 { user }` / `401` / `403` (suspended).
- `POST /logout` → `200 { ok }`. `GET /me` → `{ user | null }`.

## Favorites & preferences (auth required → 401 otherwise)
- `GET/POST /api/favorites/cafes`, `DELETE /api/favorites/cafes?cafeId=`.
- `GET/POST /api/favorites/drinks`, `DELETE /api/favorites/drinks?drinkId=`.
- `GET/PUT /api/preferences` — the coffee profile booleans.

## Recommendations
- `POST /api/recommend/drinks` `{ sweet?, bitter?, …, hot?, iced?, limit? }` →
  `{ recommendations: [{ drink, reasons }] }`.
- `GET /api/recommend/cafes?lat&lng&tags&openNow&limit` →
  `{ covered, recommendations: [{ cafe, reasons }] }`.

## Analytics
- `POST /api/analytics` `{ name, properties?, region? }` → `{ ok }`. `name` must be
  in the allow-list (`src/lib/analytics/events.ts`).

## Admin (`/api/admin/*` — `requireAdmin`, else 403)
- `GET/POST /api/admin/cafes`, `PATCH/DELETE /api/admin/cafes/[id]`.
- `PATCH /api/admin/reports/[id]` `{ status }`.
- `PATCH /api/admin/users/[id]` `{ suspended }` (admins/self protected).
