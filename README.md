# CupScout

**Find your next coffee.** A **location-first coffee discovery platform** for
**Luzon (Philippines)** and **Switzerland**. It helps people answer two
questions:

> **Where should I go?** &nbsp;•&nbsp; **What should I get?**

Open the app → it explains why it needs your location → find nearby cafes on a
list and map → open a cafe → get directions or save it.

![status](https://img.shields.io/badge/stage-foundation-blue)

## Tech stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma ·
MySQL/MariaDB (XAMPP) · Leaflet + OpenStreetMap · Nominatim geocoding · Zod ·
Vitest. Full rationale in [`docs/TECH-STACK.md`](docs/TECH-STACK.md).

## Data integrity (please read)
CupScout **never fabricates** external business data. Ratings, review counts,
opening hours, menus, prices and photos are shown **only when we have a real
source**; otherwise the UI honestly says "unavailable". The bundled dataset is a
small **curated** set of real cafes with approximate, correctable coordinates.
See [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md).

## Quick start

### Prerequisites
- Node.js 20+
- MySQL/MariaDB running (XAMPP is fine)

### Setup
```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env          # then edit if your MySQL differs from XAMPP defaults

# 3. Create the database (once), then apply schema + seed
#    (XAMPP default: user root, empty password)
npm run db:push
npm run db:seed

# 4. Run
npm run dev                   # http://localhost:3000
```
If you use the XAMPP defaults, the database name is `cafe_finder`; create it via
phpMyAdmin or:
```sql
CREATE DATABASE cafe_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (typechecks too) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run Vitest unit tests |
| `npm run db:push` / `db:seed` / `db:studio` | Prisma schema / seed / GUI |

## Deploy
CupScout is a Node/container app (not static). Fastest paths:
- **Docker (self-host / VPS):**
  ```bash
  docker compose up -d --build
  docker compose run --rm app npm run db:seed   # create admin + curated data
  ```
- **Managed (Railway/Render):** build `npm run build`, start `npm run start:prod`,
  add a MySQL database + env vars, run `npm run db:seed` once.

Serve over **HTTPS** (geolocation requires it). Full guide, env, and production
notes: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Health check: `GET /api/health`.

## Documentation
The full documentation system lives in [`docs/`](docs/). Start with
[`docs/README.md`](docs/README.md). For AI/automated contributors, read
[`CLAUDE.md`](CLAUDE.md) and [`AGENTS.md`](AGENTS.md).

## Features at a glance
- **Location-first discovery** with permission-respectful onboarding + manual
  search fallback, restricted to Luzon & Switzerland (enforced in code).
- **List + interactive map** with search, categories, filters, sorting.
- **Cafe details** with honest "unavailable" states and directions hand-off.
- **"Where should I go?"** and **"What should I order?"** — explainable cafe and
  drink recommendations.
- **Accounts** (optional): server-backed favorites + a coffee profile.
- **Admin**: dashboard, cafe CRUD, reports triage, user management.
- **Analytics** capture + admin aggregates. **Installable PWA** with an offline
  page and a data-integrity-safe caching policy.

## Admin access (dev)
The seed creates one admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(defaults `admin@cafefinder.local` / `admin12345` — change these). Log in at
`/login`, then visit `/admin`.

## Project status
Core product is built and verified (v0.2.0). Remaining polish — marker
clustering, mobile bottom-sheet, password reset, merge-duplicates tooling, and
E2E tests — is tracked in [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

## Attribution
Map tiles and geocoding © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors, used under the ODbL. Cafe names belong to their respective owners.
