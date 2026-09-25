# Environment Variables

Copy `.env.example` → `.env`. **Never commit `.env`.** No real secret values
appear in the repo.

| Variable | Purpose | Required | Used in |
|---|---|---|---|
| `DATABASE_URL` | MySQL connection string | ✅ | Prisma (`schema.prisma`, all DB access) |
| `NEXT_PUBLIC_APP_URL` | Public base URL (metadata/links) | Optional | `layout.tsx` metadata |
| `NEXT_PUBLIC_MAP_TILE_URL` | Map tile template | Optional (defaults to OSM) | `CafeMap.tsx` |
| `NEXT_PUBLIC_MAP_ATTRIBUTION` | Tile attribution text | Optional | `CafeMap.tsx` |
| `GEOCODER_PROVIDER` | Geocoder selector (`nominatim`) | Optional | `geocode.ts` |
| `GEOCODER_BASE_URL` | Geocoder base URL | Optional | `geocode.ts` |
| `GEOCODER_USER_AGENT` | **Real** descriptive UA for Nominatim | ✅ for geocoding | `geocode.ts` |
| `PLACES_PROVIDER` | Data source (`curated`) | Optional | `places/index.ts` |
| `ADMIN_EMAIL` | Seeds/updates the single admin's email | ✅ for seed | `prisma/seed.ts` |
| `ADMIN_PASSWORD` | Admin password (hashed on seed) | ✅ for seed | `prisma/seed.ts` |
| `GOOGLE_MAPS_API_KEY` | Google Places enrichment (ratings/photos/hours). **Paid**, server-only, off when blank | Optional | `src/lib/places/enrichment.ts` |
| `FOURSQUARE_API_KEY` | Foursquare Places enrichment. **Free tier, no card**, server-only, off when blank | Optional | `src/lib/places/enrichment.ts` |
| `ENRICHMENT_PROVIDER` | Force `google` or `foursquare`; blank = auto | Optional | `src/lib/places/enrichment.ts` |
| `OVERPASS_URL` | Overpass API endpoint for OSM import (defaults to overpass-api.de) | Optional | `src/lib/places/import/overpass.ts` |
| `OVERPASS_USER_AGENT` | Descriptive UA for Overpass (required by the service) | Optional | `src/lib/places/import/overpass.ts` |

## Notes
- `NEXT_PUBLIC_*` values are exposed to the browser by design — put **only**
  non-secret values there. Map tile URL/attribution are public by nature.
- `GEOCODER_USER_AGENT` must be a real app name + contact (URL or email).
  Placeholder/fake-email UAs are rejected by Nominatim with **HTTP 403**.
- XAMPP default `DATABASE_URL`: `mysql://root:@localhost:3306/cafe_finder`
  (user `root`, empty password).
- To add a keyed maps/places provider later, introduce a **non-public**
  server-side key variable (e.g. `GOOGLE_PLACES_API_KEY`) and read it only in
  server code — never prefix it with `NEXT_PUBLIC_`.
- **Change `ADMIN_PASSWORD`** before any real deployment; the seed hashes it, but
  the plaintext lives in your env file — treat it as a secret.
- **Uploaded cafe photos** are written to `public/uploads/` (git-ignored). This
  works for a single-server/XAMPP setup; a cloud object store is the production
  upgrade. If you add Google/Foursquare enrichment later, its key is a
  **server-only** variable (never `NEXT_PUBLIC_`).
