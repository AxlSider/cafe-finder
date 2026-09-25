# Architecture & Product Decisions (ADR)

Newest first. Each entry: context, options, choice, reason, consequences.

---

## 2026-09-25 · Sprint 0 security baseline
- **Admin bootstrap:** chose **both** a one-time CLI (`db:create-admin`) and an
  env-var path, with a shared strength validator that **refuses weak/default
  passwords in production** (seed skips admin in prod; CLI always enforces).
  `/api/health` bcrypt-checks admins against a weak deny-list and returns 503 in
  production. Rejected a hard Next "boot refusal" (no clean single boot hook in
  App Router) in favor of enforcement at creation time + a health signal.
- **Uploads:** added **sharp** to re-encode uploads to WebP — this validates by
  real decode (defeats spoofed content types), enforces a pixel-bomb cap, and
  **strips EXIF/GPS** (a privacy leak). Chose re-encode over an EXIF-scrub library
  because it also normalizes format/size and removes polyglot risk. Native dep;
  installs prebuilt binaries.
- **CSRF:** chose an **Origin-check in middleware** (verify when present, allow
  when absent) over CSRF tokens, because sessions are SameSite=Lax cookies and
  this adds robust defense-in-depth without breaking non-browser API clients.
- **CSP:** shipped a real CSP but kept `'unsafe-inline'` for script/style
  (inline theme script + Leaflet's inline styles). Nonce-based hardening deferred
  to Sprint 4 to avoid destabilizing Next hydration now.
- **Consequences:** dev admin login still works (dev seed warns on weak pw); prod
  requires `db:create-admin`; uploads are always WebP; a couple of API clients
  that spoof cross-site Origins will be blocked (intended).

---

## 2026-09-24 · Nearby = real radius; ratings/photos = admin-curated first
- **Context:** "Nearby" was showing cafes 150+ km away, and most cafes read
  "Rating unavailable". Both undermined the product feel.
- **Nearby fix:** `/api/cafes/nearby` constrains results to a real radius
  (default **5 km**, distances via haversine) with **explicit user expansion**
  (5→10→25→50 km) and honest empty states — no silent long-distance results.
  Text search still spans the whole covered region. Added "Near you" (GPS) vs
  "Exploring {place}" (searched) semantics and a map "Search this area" control.
- **Ratings/photos:** chose **admin-curated now** over wiring a paid API blindly.
  Rationale: real ratings/photos are owned by external providers and can't be
  scraped; Google Places is **paid** and needs the owner's billing account +
  key (which an agent can't provision). So the admin curates ratings (with a
  visible source) and uploads rights-cleared photos today, while the code path +
  docs for Google/Foursquare enrichment are ready to flip on with a key. The
  no-fabrication rule is preserved throughout.
- **Map style:** kept free **OpenStreetMap** tiles (no key, no watermark) but
  applied a **CSS tile-pane filter** to soften the light palette and render a
  proper dark map, so the basemap supports the UI. (CARTO's keyless basemaps now
  watermark, so they were rejected; a keyed clean style is opt-in via env.)
- **Consequences:** with the small curated seed, many locations legitimately show
  "expand the radius" — that's the correct, honest behavior, not a bug. Real
  ratings/photos scale with admin curation until a provider key is added.
  Uploaded photos live on local disk (`public/uploads`) — fine for XAMPP, a
  cloud store is the production upgrade.

---

## 2026-09-24 · CupScout rebrand + redesign (design-only, no rebuild)
- **Context:** The prototype UI read as a generic template; the product needed a
  credible consumer-product identity ("CupScout") without touching working
  functionality.
- **Choice:** A visual/UX redesign layered on the existing architecture: a
  token-driven design system (CSS variables → Tailwind) with light/dark, an SVG
  icon set replacing all emoji, photography-first cards, app-style mobile bottom
  nav, and a reduced-motion-safe motion system. No routes, APIs, DB, or business
  logic changed.
- **Options considered:** (a) tweak CSS on the existing theme — rejected as
  insufficient; (b) adopt a component library (MUI/Chakra) — rejected as heavy
  and off-brand; (c) a bespoke token system on the current Tailwind setup —
  chosen.
- **Theming approach:** colors are RGB-channel CSS variables so one set of class
  names themes both modes; dark applies via `prefers-color-scheme` or an explicit
  `data-theme`. Keeping the existing Tailwind color *names* let the whole app
  (incl. admin) re-skin with minimal churn.
- **Fonts:** loaded via Google Fonts `<link>` (not `next/font`) to avoid
  build-time fetch failures and keep builds offline-safe.
- **No emoji:** a hard product rule; enforced by a single icon component set.
- **Consequences:** the app now carries a real brand and dual themes; cafe
  imagery is placeholder-tiled until real photos exist (integrity preserved).
  Motion is CSS-only (no animation library) — lighter, though less physics-rich
  than a spring library.

---

## 2026-09-24 · Auth via bcryptjs + hashed-token cookie sessions
- **Context:** Need optional accounts + a single admin, on Windows/XAMPP, without
  native build pain.
- **Options:** NextAuth/Auth.js (heavier, opinionated), a hosted auth provider
  (external dependency), or a small custom email/password + session system.
- **Choice:** custom — bcryptjs (pure JS) for hashing; random token in an
  httpOnly cookie with only its SHA-256 hash stored in `Session`.
- **Reason:** minimal deps, full control, no native modules, easy to reason about
  for a portfolio; guest-first browsing needs only a thin layer.
- **Consequences:** we own security details (documented in SECURITY.md); no
  built-in social login or password reset yet. Rate limiting/CSRF are follow-ups.

## 2026-09-24 · DrinkType (global guide) separate from per-cafe Drink
- **Context:** "What should I order?" needs drink data, but inventing a specific
  cafe's menu/prices would violate the no-fabrication rule.
- **Options:** attach sample menus to real cafes (dishonest), or model general
  drink knowledge separately.
- **Choice:** a global `DrinkType` reference table (flavor attributes, no cafe, no
  price) powers recommendations; per-cafe `Drink` stays empty until a licensed
  menu source exists.
- **Reason:** recommends drink *types* honestly ("you might like a Spanish Latte
  — sweet, milk-based") without claiming any cafe serves it at a price.
- **Consequences:** the recommender is cafe-agnostic; linking recommendations to
  a specific cafe's availability waits on real menu data.

---

## 2026-09-24 · Maps & places data = Leaflet + OSM + curated dataset
- **Context:** Need maps and cafe data without fabricating business info; user
  wants a free option.
- **Options:** (a) Google Places — richest data but paid, billing + strict
  license/no-cache; (b) Mapbox + Foursquare/OSM — free tier, needs keys;
  (c) Leaflet + OSM tiles + a curated seed — free, no keys.
- **Choice:** (c), behind a provider abstraction (`src/lib/places`).
- **Reason:** zero cost/keys, honors the no-fabrication rule (curated data is a
  legitimate owned category), and the abstraction lets us adopt Google/Mapbox
  later via config only.
- **Consequences:** ratings/hours/menus are largely "unavailable" until a
  licensed source is added; that's an honesty win but a coverage-of-fields
  limitation. Public OSM/Nominatim have rate limits (fine for dev, not prod).

## 2026-09-24 · Database = MySQL/MariaDB via XAMPP, through Prisma
- **Context:** User already runs MySQL in XAMPP.
- **Options:** SQLite (zero-setup), MySQL (XAMPP), PostgreSQL (prod-grade,
  extra install).
- **Choice:** MySQL/MariaDB via Prisma.
- **Reason:** matches the user's environment; Prisma keeps it portable to
  Postgres later (change one `datasource` line + connection string).
- **Consequences:** MySQL must be running for DB work. No spatial extension used;
  distance is computed in app code (fine at current scale).

## 2026-09-24 · Coverage enforced in code, not just UI
- **Context:** Product must restrict to Luzon + Switzerland at the data level.
- **Choice:** `regionForCoords` bounding-box check in `src/lib/geo.ts`, applied
  in `/api/geocode` and `/api/cafes/nearby`, plus geocoder `countrycodes=ph,ch`.
- **Reason:** prevents out-of-scope data access regardless of UI.
- **Consequences:** bounding boxes are approximate; a cafe's stored `region` is
  authoritative. PH-but-not-Luzon (e.g. Davao) is correctly excluded (tested).

## 2026-09-24 · Vanilla Leaflet instead of react-leaflet
- **Context:** react-leaflet has historically lagged React major versions.
- **Choice:** encapsulate Leaflet in one client component with `divIcon` markers.
- **Reason:** avoids React 19 coupling and Leaflet's bundled-asset pitfalls.
- **Consequences:** we manage markers imperatively; clustering must be added
  manually later.

## 2026-09-24 · Nominatim User-Agent must be real (403 fix)
- **Context:** Geocoding returned HTTP 403 in testing.
- **Finding:** Nominatim rejects placeholder/fake-email User-Agents; a real
  descriptive UA (app name + contact URL) returns 200.
- **Choice:** default UA `CafeFinder/0.1 (+http://localhost:3000)`; documented in
  `.env.example` and TROUBLESHOOTING.
- **Consequences:** deployments must set a real `GEOCODER_USER_AGENT`.

## 2026-09-24 · No service worker in the foundation
- **Context:** PWA is desired, but caching risks stale business data.
- **Choice:** ship installable manifest now; defer the service worker until a
  data-freshness-safe caching policy is defined ([PWA.md](PWA.md)).
- **Reason:** avoid the worst failure mode (misleading hours/ratings).
- **Consequences:** no offline shell yet.
