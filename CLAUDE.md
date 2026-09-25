# CLAUDE.md — guide for AI coding sessions

**Read this before making significant changes.** Keep it and `AGENTS.md` in sync.

## What CupScout is
A location-first coffee discovery web app for **Luzon (Philippines)** and
**Switzerland** only. It helps users answer two questions: *Where should I go?*
and *What should I get?* Full product intent: `docs/PRODUCT.md`.

## Stack
- **Next.js 15 (App Router) + React 19 + TypeScript** (strict).
- **Tailwind CSS** design system (`tailwind.config.ts`, tokens in `docs/DESIGN-SYSTEM.md`).
- **Prisma ORM + MySQL/MariaDB** (XAMPP in dev). Schema: `prisma/schema.prisma`.
- **Leaflet + OpenStreetMap** raster tiles (no key). Geocoding via **Nominatim**.
- **Zod** for API input validation. **Vitest** for unit tests.

## Important directories
```
src/app/            App Router routes + API routes (route.ts)
src/app/api/        Internal REST endpoints (cafes/nearby, geocode, reports)
src/components/     UI components (client + presentational)
src/lib/            Domain logic
  geo.ts            Coverage enforcement + haversine (has tests)
  hours.ts          Open-now logic (has tests)
  geocode.ts        Nominatim proxy (SERVER-ONLY)
  format.ts         Display formatting
  places/           Provider abstraction (types, curated impl, ranking, factory)
  hooks/            Client hooks (useGeolocation)
prisma/             schema.prisma + seed.ts (curated dataset)
docs/               The documentation system (source of truth for behavior)
```

## Commands
```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build (also typechecks)
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run db:push      # apply Prisma schema to the DB (dev)
npm run db:seed      # seed the curated dataset
npm run db:studio    # Prisma Studio
```
XAMPP MySQL must be running for anything that touches the DB. Default
`DATABASE_URL` = `mysql://root:@localhost:3306/cafe_finder`.

## Conventions
- TypeScript strict; `noUncheckedIndexedAccess` is on — handle `undefined`.
- Import alias `@/*` -> `src/*`.
- API routes validate input with Zod and return typed JSON `{ error }` on failure.
- Feature code depends on `src/lib/places` **types**, never on a concrete
  provider. Add new data sources behind that interface.
- Client components are marked `"use client"`; keep server-only code (Prisma,
  geocode) out of client bundles.

## Hard rules (do NOT break)
1. **Never fabricate external business data** — ratings, review counts, hours,
   menus, prices, photos, popularity. If unknown, store null/empty and let the
   UI show "unavailable". This is the product's core integrity promise.
2. **Geographic coverage is Luzon + Switzerland only**, enforced in
   `src/lib/geo.ts` (`regionForCoords`) at the data/API layer — not just UI.
   Don't add a country switcher or widen coverage.
3. **No secrets in source.** Use env vars (`docs/ENVIRONMENT.md`). `.env` is
   gitignored; `.env.example` documents every variable.
4. **No cafe-owner/business/merchant accounts.** There is exactly ONE admin
   role. Users are optional (browsing works as guest).
5. **Keep geocoding server-side** (Nominatim usage policy + User-Agent). Never
   call Nominatim from the client. Respect its ~1 req/sec limit.
6. **Attribution required:** OpenStreetMap for tiles and geocoding must stay
   credited in the UI.
7. **Recommendations must stay explainable** — see `src/lib/places/ranking.ts`;
   no hidden scoring. Update `docs/RECOMMENDATIONS.md` if you change weights.
8. **No emoji in the UI.** Use the SVG icon set (`src/components/icons.tsx`).
9. **Use design tokens, not arbitrary values.** Colors come from the Tailwind
   token classes (which map to CSS variables); everything must work in light AND
   dark. Don't hardcode hex colors in components.

## Design system (0.3.0 — CupScout)
- Brand: `src/components/Brand.tsx` (wordmark + mark), favicon `public/icons/icon.svg`.
- Tokens: `src/app/globals.css` (CSS variables) + `tailwind.config.ts`. Light is
  `:root`; dark via `prefers-color-scheme` or `[data-theme]` (`ThemeToggle`).
- Icons: `src/components/icons.tsx` (+ `iconByKey` for data-driven lists).
- Cafe imagery: `CafePhoto` (real photo or branded monogram — never fabricated).
- Shell: `SiteHeader` (desktop nav) + `MobileTabBar` (mobile bottom nav);
  `/admin` hides consumer chrome. Motion is CSS-only and reduced-motion-safe.
- Full reference: `docs/DESIGN-SYSTEM.md`, `docs/UX-GUIDELINES.md`.

## When you make a meaningful change
1. Implement it.
2. Update the relevant `docs/*.md` to match reality (docs describe what EXISTS).
3. Add a line to `docs/CHANGELOG.md`.
4. If it's an architectural/product decision, add an entry to `docs/DECISIONS.md`.
5. Add/adjust tests for pure logic (geo, hours, ranking).

## Auth & admin (0.2.0)
- Auth in `src/lib/auth/*` (bcryptjs, hashed-token cookie sessions).
  `getCurrentUser()` / `requireUser()` / `requireAdmin()` are the entry points.
- `/admin/*` is gated in `src/app/admin/layout.tsx`; every `/api/admin/*` route
  re-checks with `requireAdmin()`. Never gate admin on the client only.
- **Admin bootstrap (Sprint 0):** production uses **`npm run db:create-admin`**
  (strong password enforced via `validateAdminPassword`). The seed does NOT
  create a default admin in production and refuses weak passwords there; in dev
  it still creates one from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (warns if weak).
- **Security baseline (Sprint 0):** CSP + HSTS (`next.config.mjs`), CSRF Origin
  check (`src/middleware.ts`), session token rotation + `revokeAllSessions`
  (`session.ts`), hardened uploads via `sharp` (WebP re-encode, EXIF/GPS strip)
  in `src/lib/uploads.ts`. See `docs/SECURITY.md` threat checklist.
- Drink recommendations use the global `DrinkType` guide, NOT per-cafe menus.

## Ratings / photos / enrichment
- Ratings/photos are **admin-curated** (admin form: rating/source/photo upload)
  OR pulled from **Google Places** via `src/lib/places/enrichment.ts` — gated on
  `GOOGLE_MAPS_API_KEY` (blank = inactive, no cost). Trigger: admin "Sync" button
  (`/api/admin/cafes/[id]/enrich`) or `npm run db:enrich`.
- Google photos are proxied live via `/api/places/photo/[id]` (key never leaves
  the server); we store only `place_id` + photo name, never image bytes.
- Nearby uses a real radius (default 5 km) with explicit expansion; distances are
  haversine from the origin. "Near you" (GPS) vs "Exploring {place}" (searched).
- Still: **never fabricate ratings** — uncurated/unmatched cafes show "unavailable".
- **Community (USER) content is allowed and distinct** from rule #1's "external
  business data": signed-in users rate cafes, upload photos, and confirm
  amenities. It's real user input, shown as "· Community" (never as Google/
  external). Aggregated in `Cafe.communityRating*`; APIs under
  `/api/cafes/[slug]/{rating,photos,amenities,community}`; UI `CafeContribute`;
  admin moderates photos. Surfaced on cards only when no external rating exists.

## Current status (0.8.0)
Built & verified: foundation PLUS auth/accounts, favorites, coffee profile,
`/order` + `/where` recommenders, admin (dashboard/cafes/reports/users/import),
analytics, PWA, marketing homepage (`/`) + app at `/app`, **marker clustering**,
mobile bottom-sheet, Google + Foursquare enrichment (key-gated; both paywall
ratings/photos), **OpenStreetMap import (~1,535 real cafes)**, **community UGC
(ratings/photos/amenities)**, SEO (sitemap/robots), deployment infra, and the
**Sprint 0 security baseline** (admin bootstrap, sessions, uploads, CSP/CSRF,
audits — see `docs/SECURITY.md`).
**Not yet built:** rate limiting + moderation (Sprint 1), dedupe (Sprint 2),
filters UI + collections + spatial index (Sprint 4), password reset (Sprint 5),
E2E/CI + object storage + deploy (Sprint 6). Roadmap: `docs/CHANGELOG.md`.
