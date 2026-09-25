# Changelog

Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-09-24 — Foundation + core loop
### Added
- Project scaffold: Next.js 15 (App Router) + React 19 + TypeScript (strict) +
  Tailwind CSS design system.
- Prisma schema for the full product (cafes, hours, amenities, tags, drinks,
  users, sessions, coffee preferences, favorites, reports, analytics) on
  MySQL/MariaDB; curated seed of 10 real cafes (Luzon + Switzerland).
- **Places provider abstraction** (`src/lib/places`) with a curated provider and
  transparent ranking; provider selectable via `PLACES_PROVIDER`.
- **Geographic coverage enforcement** (Luzon + Switzerland) in `src/lib/geo.ts`,
  applied at the geocode and nearby APIs, with unit tests.
- **Location-first home**: explains before requesting permission; manual location
  search fallback (Nominatim, coverage-restricted, server-side).
- **Discovery**: nearby list + interactive Leaflet/OSM map with list↔map sync,
  free-text search, category chips, filters, and sorting.
- **Cafe detail** page with honest "unavailable" states, mini-map, directions
  hand-off, and data-source attribution.
- **Guest favorites** (localStorage) + Saved page.
- **User reporting** (`POST /api/reports`) → stored for admin triage.
- APIs: `/api/cafes/nearby`, `/api/geocode`, `/api/reports` (Zod-validated).
- Security headers; PWA manifest + SVG icon; accessibility baseline
  (skip link, focus rings, reduced motion, 44px targets, semantic roles).
- Unit tests (geo + hours), 12 passing. Full `/docs` system, `CLAUDE.md`,
  `AGENTS.md`.

### Notes
- No ratings/hours/menus are fabricated; unknown fields display "unavailable".
- Fixed: Nominatim 403 caused by a placeholder User-Agent — default UA is now a
  real descriptive string (see DECISIONS).

## [0.9.0] — 2026-09-25 — Home polish, mobile inputs, Vercel path
### Added / changed
- **Landing redesign:** hero now shows a live, DB-backed stats strip (real cafe
  count + distinct localities + regions, cached hourly with a safe fallback so
  the build never breaks if the DB is unreachable) and a far richer product mock
  — a realistic app screen (search bar, streets/park mini-map, clustered pins, a
  live-location ping, the featured card, and a peeking second result). The whole
  mock is now a link into `/app` (hover lift + focus ring) so a tap on it — or its
  "Get directions" bar — enters the real experience instead of dead-ending.
- **Mobile-first inputs:** `.field` is 16px on mobile (`text-base sm:text-sm`) to
  stop iOS Safari from auto-zooming the viewport on focus; applied to every
  search box incl. the compact location search. Hero stats stay legible on small
  phones (responsive sizing, `tabular-nums`).
- **Vercel-safe uploads:** `saveImage` now degrades gracefully on a read-only /
  ephemeral serverless filesystem — returns an honest 503 "uploads not available"
  instead of a 500. Local/persistent hosts are unchanged.
- **Deployment:** added a Vercel path to `docs/DEPLOYMENT.md` (hosted MySQL +
  object-storage caveats, run migrations/seed/admin from local against the hosted
  DB) and a `db:deploy` script (`prisma migrate deploy`).

## [0.8.0] — 2026-09-25 — Sprint 0: security baseline
### Added / changed (security)
- **Admin bootstrap:** removed the default seeded admin in production; added
  `npm run db:create-admin` and a strength validator (`validateAdminPassword`,
  ≥12 chars / 3 classes / deny-list, bcrypt cost 12). Seed refuses weak/default
  admin passwords in production. `/api/health` flags an insecure default admin
  (503) in production.
- **Sessions:** token **rotation on login**, `revokeAllSessions()` helper for
  password change/reset, kept httpOnly/Secure/SameSite + hashed-token storage.
- **Uploads hardened** with `sharp`: real-decode magic-byte validation, pixel-bomb
  cap, resize, WebP re-encode that **strips EXIF/GPS**, randomized `.webp` names.
- **CSP** + HSTS added to `next.config.mjs`; **CSRF** origin check in
  `src/middleware.ts` (blocks cross-site mutating `/api/*`).
- **Audits:** admin gating (all `/api/admin/*` + `/admin` pages) and IDOR
  (community/favorites/preferences scope every write to the session user) —
  both verified; checklist in `docs/SECURITY.md`.
- Graceful degradation: discovery now shows an error state (not "no cafes")
  when the API/DB is unreachable.
- Fixed a Leaflet console error (`_leaflet_id in undefined`) on map unmount:
  guarded the deferred `invalidateSize` against a strict-mode/teardown race,
  reset map refs on cleanup, and wrapped cluster `zoomToShowLayer` in try/catch.
- Tests: `adminSecurity` + `origin` (CSRF) units → **26 passing**.
### Notes
- New deps: `sharp`. CSP keeps `'unsafe-inline'` for now (Leaflet/theme script);
  nonce hardening is Sprint 4. Docs mismatches from ≤0.7.0 reconciled.

## [0.7.0] — 2026-09-24 — Community content (user ratings, photos, amenities)
Users can now fill cafes in — a distinct, honest **USER** data category (never
presented as external/Google data).
### Added
- **User ratings** (1–5): signed-in users rate a cafe; a denormalized aggregate
  (`communityRating`/`communityRatingCount`) is shown as "N · Community". Surfaces
  on cards/hero when no external rating exists (`cafeRowToSummary`).
- **User photos**: upload (≤5 MB, per-user cap) → gallery on the cafe page; the
  first community photo becomes the card's lead photo, attributed "Community photo".
- **Amenity confirmations**: users tap amenities a cafe has; aggregated by count.
- APIs: `GET /api/cafes/[slug]/community`, `POST/DELETE …/rating`,
  `POST …/photos`, `POST …/amenities` (all auth-gated). New `CafeContribute` UI
  on the cafe page; shared `saveImage` helper.
- **Admin moderation**: community photos listed on the cafe editor with delete
  (`DELETE /api/admin/photos/[id]`); photos also carry a `hidden` flag.
- Schema: `CafeRating`, `CafePhoto`, `CafeAmenityVote` + `Cafe.communityRating*`.
- Imported Vigan/Dagupan/Naga/Batangas (now **1,535** cafes).
### Notes
- Post-moderation model (photos visible immediately, admin/report can remove).
  Pre-moderation + rate limiting are recommended follow-ups for scale.

## [0.6.2] — 2026-09-24 — Map clustering, nicer placeholders, nearby bugfix
### Fixed
- **Critical nearby bug:** `searchNearby` fetched only the first 200 cafes then
  filtered by distance, so cities imported after the first 200 rows (e.g.
  Tuguegarao) returned **0 results**. Now filters by a geographic bounding box
  **in the database** (uses the lat/lng index) before exact haversine — verified
  Tuguegarao returns its 18 cafes; dense cities unaffected.
### Added / changed
- **Marker clustering** (`leaflet.markercluster`): dense city maps now show
  brand-styled count bubbles that expand on zoom, not a pile of pins. Switched
  `CafeMap` to static Leaflet imports so the plugin binds to the same instance.
- **Richer placeholder imagery** in `CafePhoto`: layered gradient + soft
  highlight + oversized faded coffee mark + monogram, so the many photo-less
  cafes read as a designed system.
- More city deep-links (`/app?place=tuguegarao|vigan|dagupan|naga|batangas|…`);
  `suppressHydrationWarning` on `<html>` for the theme script.

## [0.6.1] — 2026-09-24 — Foursquare enrichment + more Luzon cities
### Added
- **Foursquare Places enrichment** (`FoursquareProvider`) — free tier, **no
  credit card**: real rating (0–10→0–5), review count, price, website, phone,
  hours, and a direct-CDN photo. Enabled via `FOURSQUARE_API_KEY`. The enrichment
  layer is now multi-provider (`ENRICHMENT_PROVIDER` forces one; else Google if
  keyed, else Foursquare). `applyEnrichment` handles direct photo URLs
  (Foursquare) vs proxied photos (Google).
- **More import presets**: Tuguegarao, Vigan, Dagupan, Naga, Batangas. Imported
  Tuguegarao (18 real cafes) so northern-Luzon locations aren't empty.
### Notes
- Updated `FoursquareProvider` to Foursquare's **2025 Places API**
  (`places-api.foursquare.com`, Bearer auth + version header; old v3 returns 401).
- **Verified finding:** Foursquare's free tier covers search but **rating/photos
  are Premium (paid credits)** — 429 without credits, handled gracefully. There
  is currently no free source for real cafe ratings/photos at scale.

## [0.6.0] — 2026-09-24 — Real data (OpenStreetMap import) + SEO
### Added
- **OpenStreetMap cafe import** (Overpass API — free, no key): `src/lib/places/
  import/*`, admin **Import** page (`/admin/import`), and `npm run db:import
  [city]`. Resilient client (User-Agent, `out center`, retry/backoff on 429/504
  and throttled-empty responses), conservative `opening_hours` parsing, OSM-id
  dedup, honest sourcing (source=EXTERNAL "OpenStreetMap", **no fabricated
  ratings**). Attribution shown.
  - **Loaded ~1,400 real cafes** across Baguio, Makati, Quezon City, Manila,
    Taguig/BGC, Zürich and Geneva — up from 10.
- **SEO surfaces:** `app/sitemap.ts` (static routes + every cafe page) and
  `app/robots.ts` (allow all, disallow /admin, /api, /account; sitemap link).
- **Free OSM/Wikimedia photo import** (`wikimedia_commons` / `image` tags) +
  graceful image fallback in `CafePhoto` (broken remote photo → branded tile).
  Honest finding: OSM has almost no cafe photos (~1 in 250), so this yields very
  few in practice — the code is ready, but the data isn't there. Real photos at
  scale need a provider account (Foursquare free tier, or Google).
### Notes
- Optional env: `OVERPASS_URL`, `OVERPASS_USER_AGENT`.

## [0.5.0] — 2026-09-24 — Product homepage + deployment-ready
### Added
- **Marketing homepage at `/`** (hero, the two core questions, benefit-led
  feature grid, city quick-starts, CTA) with an on-brand product mock. The
  discovery app moved to **`/app`**; nav/tab-bar/links updated.
- **City deep links** — `/app?place=baguio|makati|manila|zurich` preload a
  location so a first visit lands on a populated experience (no GPS needed).
- **Deployment**: `Dockerfile` + `docker-compose.yml` (app + MySQL, one command)
  + `.dockerignore`; baseline Prisma migration (`prisma/migrations/0_init`);
  `npm run start:prod` (`migrate deploy` + `next start`); `postinstall` prisma
  generate; **`GET /api/health`** (DB check). Rewrote `docs/DEPLOYMENT.md` with
  managed (Railway/Render), Docker, and manual Node paths, HTTPS/uploads notes.
### Verified
- Production build + `next start` boots against MySQL; `/api/health` → `db: up`;
  homepage and `/app` deep-links serve 200. (Docker image not run — Docker isn't
  installed in this environment; the setup is standard and documented.)

## [0.4.1] — 2026-09-24 — Google Places enrichment (built, key-gated)
### Added
- **Google Places (New) enrichment** (`src/lib/places/enrichment.ts` +
  `applyEnrichment.ts`): matches a cafe (`searchText`, coord-biased) → stores
  `place_id`, then pulls `rating`, `userRatingCount`, `priceLevel`, `website`,
  `phone`, `regularOpeningHours`, and a photo — with a **minimal field mask** to
  limit billing. Writes `ratingSource="Google"`, `source=EXTERNAL`, `lastSyncedAt`.
- **Admin "Sync"** action per cafe (`POST /api/admin/cafes/[id]/enrich`) and a
  batch **`npm run db:enrich`** script. Both are **gated on `GOOGLE_MAPS_API_KEY`**
  and return a clear "add a key" message (and change nothing) when it's absent.
- **Caching-compliant photos:** persist only the photo resource name; serve via
  `/api/places/photo/[id]`, which resolves Google's keyless `photoUri`
  server-side (`skipHttpRedirect=true`) — the API key never reaches the client.
- Rating **source shown** in the UI (card + detail + bottom sheet), e.g. "4.8 · Google".
- Schema: `Cafe.googlePhotoName`. Env: `GOOGLE_MAPS_API_KEY` (server-only, blank
  by default). Full cost/attribution/caching notes in DATA-SOURCES.md.
### Notes
- Verified: compiles/typechecks; both entry points gate cleanly with no key.
  Live enrichment requires the account owner to add a billing key (unverifiable
  here). No fabricated ratings — uncurated cafes still show "unavailable".

## [0.4.0] — 2026-09-24 — Location correctness, map overhaul, cafe photos
No rebuild — targeted fixes to location, map, and data-enrichment tooling.
### Added
- **Admin image upload** (`/api/admin/upload` → `public/uploads`, JPEG/PNG/WebP
  ≤5 MB, admin-only) + photo/attribution/`googlePlaceId` fields in the cafe
  editor. `CafePhoto` shows the real photo when set; branded monogram otherwise.
- **Radius-based nearby** with explicit expansion (5→10→25→50 km) and honest
  "No cafes within X km — Expand" empty states; text search spans the region.
- **"Near you" (GPS) vs "Exploring {place}" (searched)** semantics.
- **Map overhaul:** free OpenStreetMap tiles with a CSS tile-pane filter (softer
  light palette + a real dark map), custom teardrop markers (active pops, teal
  user dot), center-on-origin framing, and a **"Search this area"** control.
  Mobile map gains a **bottom-sheet** cafe preview on marker tap.
- Schema: `Cafe.googlePlaceId` / `externalPlaceId` / `lastSyncedAt` /
  `photoAttribution` for future rating/photo enrichment.
- "Where to go" recommendations capped to a 25 km catchment.
### Changed
- Ratings/photos strategy documented as **admin-curated now, external API code
  path ready** (Google/Foursquare) — see DATA-SOURCES.md / DECISIONS.md.
### Notes
- No new runtime deps. `DATABASE_URL` / storage keys unchanged.

## [0.3.0] — 2026-09-24 — CupScout rebrand + full UI/UX redesign
A complete visual/UX redesign (no functional rebuild — all features, routes,
APIs, data logic, and the geographic/data-integrity rules are unchanged).
### Added
- **CupScout brand identity**: wordmark ("Cup" + amber "Scout") and a pin+cup
  mark (`src/components/Brand.tsx`, `public/icons/icon.svg`), used in header,
  auth, empty states, favicon, and PWA icon.
- **Token-driven design system** with **light & dark themes** (CSS variables →
  Tailwind), a `ThemeToggle`, and a no-flash theme script.
- **Professional SVG icon set** (`src/components/icons.tsx`) replacing **all
  emoji** across the product.
- **Photography-first cafe cards** (`CafePhoto` + `CafeCard` featured/standard/
  compact variants); real photos when available, branded monogram tiles
  otherwise (never fabricated/stock imagery).
- **App-style mobile bottom navigation** (`MobileTabBar`) + redesigned desktop
  header (`SiteHeader`); admin fully separated from consumer chrome.
- Redesigned homepage/discovery, cafe details (image hero), "Where should I go?"
  (stepped), "What should I order?" (signature "Your match" reveal), Saved,
  auth, and account screens.
- **Motion system**: spring/emphasized easings, `fade-up`/`scale-in`/`sheet-up`/
  `shimmer` keyframes, skeleton shimmer — all gated by `prefers-reduced-motion`.
- Inter (text) + Sora (display) type system.
### Changed
- Product name rebranded to **CupScout** across UI, metadata, manifest, seed
  provenance (`CupScout curated`), and docs. Internal identifiers (db name,
  storage keys) unchanged.
- Map markers restyled to brand amber (cafes) + teal (user location); no emoji.
### Notes
- No new runtime deps. Fonts load via Google Fonts stylesheet (graceful,
  build-safe). DB schema unchanged.

## [0.2.0] — 2026-09-24 — Accounts, recommendations, admin, PWA
### Added
- **Authentication**: email/password with bcryptjs hashing; opaque session
  tokens stored only as SHA-256 hashes in httpOnly cookies; `/api/auth/*`
  (register, login, logout, me); client `AuthProvider`; login/register pages.
- **Single admin** bootstrapped by the seed from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Server-backed favorites** (`/api/favorites/cafes`, `/drinks`) with guest→user
  migration of localStorage saves on login; Saved page now syncs for users.
- **Coffee profile** (`/api/preferences`) + account page editor.
- **Drink recommendation engine** ("What should I order?", `/order`): matches a
  seeded, honest **DrinkType** guide (general coffee knowledge, no cafe menus/
  prices) against preferences, with explainable reasons. `/api/recommend/drinks`.
- **Cafe recommendation** ("Where should I go?", `/where`): intent-based, reuses
  the transparent scorer to return reasons. `/api/recommend/cafes`.
- **Admin** (`/admin/*`, server-gated): dashboard (counts + analytics + reports),
  cafe CRUD (create/edit/delete, featured, editorial tags/amenities), reports
  triage (resolve/reject/reopen), user management (suspend). Admin APIs under
  `/api/admin/*`, all `requireAdmin`-gated.
- **Analytics capture**: client `track()` (sendBeacon) + `/api/analytics` +
  server recorder; events wired into search, categories, saves, directions,
  recommendations, reports, denied/out-of-coverage; admin dashboard aggregates.
- **PWA service worker** (`public/sw.js`): cache-first static shell, network-first
  navigations with an `/offline` fallback, and **network-only for `/api/*`** so
  business data is never served stale. Registered in production only.
- Unit tests for the drink recommender. 16 tests passing.

### Notes
- New dependency: `bcryptjs`, `server-only`. New model: `DrinkType`.

## Unreleased / planned
Marker clustering, mobile bottom-sheet map, account email/password change &
recovery, richer analytics dashboards, E2E tests, API route tests. See per-doc
"Status" sections.
