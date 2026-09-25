# Data Sources

This is the most important doc for understanding CupScout's integrity model.

## Data ownership categories
Every piece of data belongs to exactly one category (mirrored by the
`DataSource` enum in `prisma/schema.prisma`):

| Category | Meaning | Examples |
|---|---|---|
| **CURATED** | CupScout owns/maintains it | cafe name/locality, editorial tags & amenities, approximate coordinates, descriptions |
| **EXTERNAL** | Imported from a third party; attribution applies | (none bundled yet) ratings, hours, menus from a licensed provider |
| **USER** | User-generated (real contributions, clearly labeled "Community") | favorites, reports, coffee preferences, **community ratings, photos, amenity confirmations** |

## The no-fabrication rule
We **never invent** ratings, review counts, opening hours, menus, prices,
photos, or popularity. When we lack a real source, the field is `null`/empty and
the UI states it plainly ("Rating unavailable", "Hours unavailable", "Menu
information isn't available for this cafe yet").

The bundled seed (`prisma/seed.ts`) therefore ships:
- ✅ Real cafe **names** and **localities** (publicly known cafes).
- ✅ **Approximate** area-level coordinates, explicitly flagged as curated and
  **correctable via the report flow**.
- ✅ **Editorial** tags/amenities — our own classification, not scraped facts.
- ⛔ **No** ratings, review counts, hours, prices, or menus (left unavailable).

## Providers in use

### OpenStreetMap raster tiles (maps)
- **Purpose:** base map imagery. A CSS tile-pane filter softens the palette
  (light) and produces a dark map (dark) so it supports, not overpowers, the UI.
- **Coverage:** global (we only display PH + CH).
- **Cost/limits:** free, no key, no watermark; the public tile servers have a
  [usage policy](https://operations.osmfoundation.org/policies/tiles/) — fine for
  dev/low traffic; production should use a tile host or self-host. A cleaner
  **keyed** basemap (MapTiler/Stadia/CARTO-with-token) is an opt-in via
  `NEXT_PUBLIC_MAP_TILE_URL` (subject to that provider's terms/approval).
- **Attribution:** "© OpenStreetMap contributors" (map control + footer).
- **License:** ODbL.

### OpenStreetMap Overpass API (cafe import)
- **Purpose:** bulk-import **real cafes** (`amenity=cafe`) for a city into the
  dataset — names, coordinates, and often website, phone, some amenities
  (Wi-Fi/outdoor), and opening hours. This is how coverage scales.
- **Cost/limits:** free, no key. Public instance rate-limits (2 slots) and
  overloads under load (429/504); the client (`src/lib/places/import/overpass.ts`)
  retries with backoff, honors `Retry-After`, and requires a descriptive
  `User-Agent`. `out center` is used so geometry is included.
- **No ratings:** OSM has none, so imported cafes keep `rating = null`
  ("unavailable") until curated or Google-synced — density without fabrication.
- **Opening hours:** parsed conservatively (`parseOpeningHours`); anything
  ambiguous is skipped rather than guessed.
- **Dedup:** rows are matched by `externalPlaceId = osm:node/<id>`; re-imports
  refresh, never duplicate. Curated cafes are never touched.
- **Attribution:** "© OpenStreetMap contributors" (shown on cards/map/detail).
  **License:** ODbL. Trigger: admin **Import** page or `npm run db:import [city]`.

### Nominatim (geocoding — search + reverse)
- **Purpose:** manual location search and reverse geocoding of device coords.
- **Coverage:** global; we restrict to `countrycodes=ph,ch` and filter results
  to the coverage bounds.
- **Cost/limits:** free public instance, **~1 request/second**, and it
  **requires a real descriptive `User-Agent`** (placeholder/fake-email UAs are
  rejected with HTTP 403 — we learned this the hard way; see
  [DECISIONS.md](DECISIONS.md)). Set `GEOCODER_USER_AGENT`.
- **Called server-side only** so the UA + rate policy stay on our side.
- **License:** ODbL.

## Fallback behavior
- Geocoder unavailable → search shows an error; the app still works with
  coordinates (distances/list/map don't need geocoding).
- No cafes match → honest empty state.

## Ratings, reviews & photos — strategy

CupScout is a discovery product, so it wants real ratings and photos. But that
data is owned by external providers and can't be scraped. The current strategy
(chosen 2026-09-24) is **admin-curated now, external API code path ready to flip
on later**:

### Admin-curated (active)
- The single admin enters `rating`, `reviewCount`, `ratingSource`, `priceLevel`,
  and opening hours per cafe in the admin editor. The UI shows the **source**
  (e.g. "4.8 · Google") so ratings are never implied to be CupScout's own.
- The admin uploads **rights-cleared photos** (`/api/admin/upload` →
  `public/uploads`, ≤5 MB, JPEG/PNG/WebP), stored on `Cafe.photoUrl` with an
  optional `photoAttribution`. The admin is responsible for having the rights.
- `Cafe.googlePlaceId` / `externalPlaceId` / `lastSyncedAt` columns exist to hold
  an external identity for future automated refresh.
- **Still honest:** anything not curated stays `null` and shows "unavailable" —
  no fabrication, no estimates, no sentiment-to-number conversion.

### External enrichment (Google Places — BUILT, inactive until a key is set)
The integration is implemented and gated on `GOOGLE_MAPS_API_KEY`. With no key it
is completely inactive (no calls, no cost, ratings stay "unavailable"). Code:
`src/lib/places/enrichment.ts` (+ `applyEnrichment.ts`); trigger via the admin
**"Sync"** button (`POST /api/admin/cafes/[id]/enrich`) or the batch script
`npm run db:enrich`.

**Provider:** Google Places API (New).
- **Match:** `places:searchText` (name + locality, biased to the cafe's coords,
  500 m) → stores the stable `place_id` (`Cafe.googlePlaceId`).
- **Details field mask (minimal, to limit field-based billing):** `id`, `rating`,
  `userRatingCount`, `priceLevel`, `websiteUri`, `internationalPhoneNumber`,
  `regularOpeningHours`, `photos`.
- **Writes:** `rating`, `reviewCount`, `priceLevel`, `website`, `phone`,
  `ratingSource = "Google"`, opening hours (`CafeHour`), `source = EXTERNAL`,
  `lastSyncedAt`. Admin-uploaded photos (`/uploads/...`) are **not** overwritten.
- **Photos (caching-compliant):** we persist only the photo *resource name*
  (`googlePhotoName`) — never the image bytes. `Cafe.photoUrl` points at
  `/api/places/photo/[id]`, which resolves Google's **keyless** `photoUri`
  server-side (`skipHttpRedirect=true`, key never leaves the server) and
  redirects. Attribution "Google" is shown on the card/detail.

**Cost & policy — DO NOT assume free.** Google Maps Platform uses field-based
billing and **requires a billing account**; enabling this key incurs cost per
request/field. Enable only "Places API (New)", restrict the key, and keep the
field mask minimal. `GOOGLE_MAPS_API_KEY` is **server-only** (never
`NEXT_PUBLIC_`). Respect Google's attribution and no-caching rules (we store only
`place_id` + photo name; rating/hours/photos are live/refreshable). **Never
scrape Google Maps.**

### Foursquare Places (BUILT — but ratings/photos are PAID)
Implemented behind the same abstraction (`FoursquareProvider`), targeting
Foursquare's **2025 Places API** (`places-api.foursquare.com`, `Authorization:
Bearer <key>` + `X-Places-Api-Version`). Enable with **`FOURSQUARE_API_KEY`**
(+ optional `FOURSQUARE_API_VERSION`).

**Verified against a live free key (2026-09):** place **search** and core fields
(name, location, category) are **free**, but **`rating`, `photos`, and hours are
Premium** — requesting them returns HTTP 429 *"no API credits remaining …
purchasing credits is required."* So Foursquare's free tier does **not** provide
ratings/photos; it needs paid credits, the same as Google. The provider handles
the 429 gracefully (returns no data, no crash) so it's harmless without credits.

Fields when credits exist: rating (0–10 → 0–5), price (1–4 → tiers), website,
phone, hours, photo (CDN URL). `ratingSource`/attribution "Foursquare".

**Provider selection:** `ENRICHMENT_PROVIDER` ("google" | "foursquare") forces
one; otherwise Google if its key is set, else Foursquare.

### Reality check on free ratings/photos
As of 2026, **no provider gives real cafe ratings/photos for free at scale** —
Google needs billing, Foursquare needs paid credits, and OSM has almost no cafe
photos (~1/250). The honest options are: (a) ship with "unavailable" + branded
placeholders (default), (b) admin-curate standout cafes by hand, or (c) accept a
small paid spend on Google/Foursquare credits.

### Photo fallback
When a cafe has no photo, `CafePhoto` renders a branded monogram tile — clearly a
placeholder, never a fabricated or unrelated stock image.

## Swapping to a paid provider later
Feature code depends only on `src/lib/places/types.ts`. To add Google Places or
Mapbox: implement `PlacesProvider`, register it in `src/lib/places/index.ts`,
set `PLACES_PROVIDER`. Then honor **that** provider's licensing (e.g. Google
forbids caching most fields and mandates specific attribution). Document the new
provider here before shipping it.
