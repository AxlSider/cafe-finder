# Troubleshooting

## Database won't connect (`Can't connect to MySQL server`)
- Start MySQL/MariaDB (XAMPP Control Panel → MySQL → Start).
- Verify `DATABASE_URL` matches your setup (XAMPP default: `root`, empty password,
  port 3306).
- Ensure the `cafe_finder` database exists:
  `CREATE DATABASE cafe_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

## `prisma` errors about missing client
- Run `npm run db:generate` (or `npx prisma generate`). It regenerates after
  schema changes and after install.

## Geocoding returns 502 / "Location lookup is unavailable"
- The most common cause: **Nominatim rejects the User-Agent (HTTP 403)**. Set a
  **real** `GEOCODER_USER_AGENT` (app name + contact URL/email). Placeholder or
  fake-email UAs are blocked.
- You may also be rate-limited (~1 rps on the public instance). Wait/retry.
- Restart the dev server after changing `.env` (env is read at startup).

## Map is blank / tiles not loading
- Check network access to the tile server; confirm `NEXT_PUBLIC_MAP_TILE_URL`.
- Ensure `leaflet/dist/leaflet.css` is imported (it is, in `layout.tsx`).
- The map is client-only (`ssr:false`); a hard refresh helps after code changes.

## "CupScout currently covers Luzon and Switzerland."
- Expected when your coordinates/searched location are outside coverage. Use a
  Luzon or Switzerland location. Coverage bounds live in `src/lib/geo.ts`.

## No cafes appear
- **First check the database is running** — `curl localhost:3000/api/health`
  should return `{"db":"up"}`. If it says `db:down`, XAMPP MySQL/MariaDB has
  stopped; start it (XAMPP Control Panel → MySQL → Start). A down DB makes cafe
  queries fail, which the UI now shows as an error (not a silent empty list).
- Did you seed/import? `npm run db:seed` (+ `npm run db:import <city>` for OSM
  cafes). Confirm your origin is within an imported city's radius.

## Location permission does nothing
- Browsers only allow geolocation on `https://` or `http://localhost`. Use
  `localhost`, not a LAN IP, in dev.

## Build fails on types
- Run `npm run typecheck` for the specific error. Strict mode +
  `noUncheckedIndexedAccess` require handling `undefined`.
