# Deployment

CupScout is a Next.js 15 app with a MySQL database (Prisma). It runs as a
long-lived Node server (App Router + route handlers + file uploads), so host it
on a **Node/container platform**, not a static host. Below are three real paths;
pick one.

> **HTTPS is required in production.** Browser geolocation only works on
> `https://` (or `localhost`). Every option below should be served over HTTPS.

---

## Prerequisites
- Node.js 20+ (for manual/CI) or Docker.
- A MySQL 8 / MariaDB database.
- Env vars from [ENVIRONMENT.md](ENVIRONMENT.md) — at minimum `DATABASE_URL`,
  `NEXT_PUBLIC_APP_URL`, a real `GEOCODER_USER_AGENT`, and `ADMIN_EMAIL` /
  `ADMIN_PASSWORD`.

## Database migrations & admin
- Schema is applied with **`prisma migrate deploy`** (baseline migration lives in
  `prisma/migrations/0_init`). The `npm run start:prod` script runs it before
  starting.
- Create the single admin once: **`npm run db:seed`** (idempotent; also loads the
  curated cafes + drink guide). It reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Path V — Vercel (serverless)
Vercel runs the app as serverless functions. It works, but Vercel does **not**
give you a database or a persistent filesystem, so two things must be arranged:

1. **A hosted MySQL** — XAMPP/local MySQL is not reachable from Vercel. Use a
   managed MySQL such as **PlanetScale, Railway, or Aiven** and copy its
   connection string into `DATABASE_URL`.
2. **Uploads need object storage** — Vercel's filesystem is read-only/ephemeral,
   so `public/uploads` writes fail. The app handles this gracefully (photo
   uploads return a clear "not available" message instead of crashing — see
   `src/lib/uploads.ts`), and everything else works. To actually enable uploads,
   move them to an object store (Vercel Blob / S3 / R2) behind the `photoUrl`
   field. Google/Foursquare-enriched photos are unaffected (proxied live).

**Steps**
1. Push this repo to GitHub (already done if you're reading this there).
2. In Vercel: **New Project → import the repo.** Framework preset auto-detects
   Next.js. Leave the build command as default (`next build`); `postinstall`
   runs `prisma generate` automatically.
3. Add **Environment Variables** (Project → Settings → Environment Variables),
   from [ENVIRONMENT.md](ENVIRONMENT.md):
   - `DATABASE_URL` — your hosted MySQL string
   - `NEXT_PUBLIC_APP_URL` — your `https://<project>.vercel.app` URL
   - `GEOCODER_USER_AGENT` — real app name + contact (Nominatim requires it)
   - optional: `FOURSQUARE_API_KEY` / `GOOGLE_MAPS_API_KEY`, tile vars
   - do **not** set `ADMIN_PASSWORD` here unless you also seed; see step 5.
4. **Run migrations against the hosted DB from your machine** (Vercel has no
   persistent shell), pointing `DATABASE_URL` at the hosted DB:
   ```bash
   DATABASE_URL="mysql://<hosted>" npm run db:deploy   # prisma migrate deploy
   DATABASE_URL="mysql://<hosted>" npm run db:seed      # curated cafes + drink guide
   # import real OSM cafes as desired, e.g.:
   DATABASE_URL="mysql://<hosted>" npm run db:import baguio
   ```
5. **Create the admin** against the hosted DB (strong password enforced):
   ```bash
   DATABASE_URL="mysql://<hosted>" ADMIN_EMAIL="you@example.com" \
     ADMIN_PASSWORD="<strong-unique>" npm run db:create-admin
   ```
6. Redeploy if needed, then log in at `/login` → `/admin`.

> Prefer a long-lived Node host (Path A/B/C below) if you want working local
> uploads without wiring object storage. Vercel is great for the read/browse
> experience and the recommenders; only user/admin **photo uploads** need the
> extra storage step.

---

## Path A — Managed platform (recommended: Railway / Render)
Easiest "real website" deploy. The platform builds from your repo and provisions
MySQL.

1. Push the repo to GitHub.
2. Create the app service from the repo. Build command `npm run build`, start
   command **`npm run start:prod`**.
3. Add a **MySQL** database (Railway: "New → Database → MySQL"; Render: use an
   external MySQL such as PlanetScale/Aiven). Copy its connection string.
4. Set env vars (from ENVIRONMENT.md): `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`
   (your deployed URL), `GEOCODER_USER_AGENT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   optionally `GOOGLE_MAPS_API_KEY`.
5. Deploy. Then run the seed once (Railway/Render one-off shell):
   `npm run db:seed`.
6. Log in at `/login` with your admin credentials → `/admin`.

**Uploads note:** managed platforms often have an ephemeral filesystem, so
admin-uploaded photos in `public/uploads` may not persist across redeploys.
Attach a persistent disk/volume if the platform supports it, or move uploads to
an object store (see "Scaling" below). Google-enriched photos are unaffected
(they're proxied live).

## Path B — Docker Compose (VPS / self-host)
One command brings up MySQL + the app.
```bash
# edit passwords + ADMIN_* + GEOCODER_USER_AGENT in docker-compose.yml first
docker compose up -d --build
docker compose run --rm app npm run db:seed   # create admin + curated data (once)
```
The app is on `http://<host>:3000`. Put a reverse proxy (Caddy/Nginx/Traefik) in
front for HTTPS and set `NEXT_PUBLIC_APP_URL` to the public URL. Uploaded photos
persist in the `uploads` volume; the DB in `db-data`.

## Path C — Manual Node host / VM
```bash
npm ci
npm run build
# ensure DATABASE_URL etc. are set in the environment
npm run start:prod        # runs `prisma migrate deploy` then `next start`
npm run db:seed           # once, to create the admin + curated data
```
Run it under a process manager (pm2/systemd) behind an HTTPS reverse proxy.

---

## Production notes
- **Map tiles:** the default public OSM tiles are fine for low traffic but have a
  usage policy. For real traffic, use a tile host or a keyed provider
  (`NEXT_PUBLIC_MAP_TILE_URL`) — see [MAPS.md](MAPS.md).
- **Geocoding:** the public Nominatim instance is ~1 req/sec and needs a real
  `GEOCODER_USER_AGENT`. For production, self-host Nominatim or use a paid
  geocoder (kept server-side).
- **Ratings/photos enrichment:** set `GOOGLE_MAPS_API_KEY` to enable it (paid,
  see [DATA-SOURCES.md](DATA-SOURCES.md)); leave blank to stay curated-only.
- **Security headers** are set in `next.config.mjs`. Change `ADMIN_PASSWORD`.

## Scaling / follow-ups
- Move uploads to an object store (S3/R2) behind the existing `photoUrl` field.
- Add a CDN in front of static assets.
- Add rate limiting on auth/reports/geocode (documented in SECURITY.md).

## Rollback
- App: redeploy the previous image/commit.
- DB: migrations are additive; restore from a backup for destructive rollbacks.

## Post-deploy checklist
- [ ] `GET /api/health` returns `{ status: "ok", db: "up" }`
- [ ] HTTPS enabled (geolocation works)
- [ ] Admin can log in and reach `/admin`
- [ ] Env vars set (DB, geocoder UA, admin, app URL)
- [ ] Seed run once (curated cafes + admin present)
