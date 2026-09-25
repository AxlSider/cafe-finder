# Tech Stack

| Technology | Version | Purpose | Why |
|---|---|---|---|
| **Next.js** | 15.x (App Router) | Full-stack React framework, routing, API routes, SSR | Required by spec; App Router gives server components + colocated API routes without a separate backend |
| **React** | 19.x | UI | Required by spec |
| **TypeScript** | 5.x (strict) | Type safety across app + domain logic | Catches errors at build; `noUncheckedIndexedAccess` on |
| **Tailwind CSS** | 3.x | Styling / design system | Token-driven, fast, consistent; tokens in `tailwind.config.ts` |
| **Prisma** | 6.x | ORM + migrations + typed client | Type-safe DB access; portable across MySQL/Postgres |
| **MySQL / MariaDB** | 10.4 (XAMPP) | Relational database | User already runs MySQL via XAMPP |
| **Leaflet** | 1.9.x | Interactive map | Free, no API key, works with OSM tiles |
| **OpenStreetMap** | — | Map tiles | Free (ODbL); attribution required |
| **Nominatim** | — | Geocoding (search + reverse) | Free OSM geocoder; server-side only, usage-policy bound |
| **Zod** | 3.x | Runtime input validation | Validates API query/body; single source of truth for shapes |
| **Vitest** | 2.x | Unit testing | Fast, TS-native; used for geo/hours/ranking logic |

## Notable choices
- **Vanilla Leaflet, not react-leaflet** — avoids React-version coupling; the
  map is one self-contained client component (`src/components/CafeMap.tsx`).
- **Provider abstraction** (`src/lib/places`) — feature code never imports a
  concrete data provider, so Google/Mapbox can replace the curated source later
  via config. See [DATA-SOURCES.md](DATA-SOURCES.md) and [DECISIONS.md](DECISIONS.md).
- **No auth library yet** — auth is designed (see [AUTHENTICATION.md](AUTHENTICATION.md))
  but not implemented in the foundation; guest browsing is fully functional.

## Not used (and why)
- **PostGIS / spatial DB extensions** — the curated dataset is small; haversine
  in application code (`src/lib/geo.ts`) is sufficient and DB-portable. Revisit
  if the dataset grows large.
- **A separate backend service** — Next.js route handlers cover the API surface.
