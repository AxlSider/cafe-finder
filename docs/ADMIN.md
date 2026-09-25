# Admin

## Status: implemented (0.2.0)
There is exactly **one** platform administrator role (`Role.ADMIN`). There are
**no** cafe-owner/business/merchant accounts, dashboards, or subscriptions.
Built under `src/app/admin/*` (server-gated in `admin/layout.tsx`) with APIs
under `src/app/api/admin/*` (all `requireAdmin`-gated).

## Capabilities (as built)
- **Dashboard** (`/admin`): counts (cafes, users, open reports, drink types),
  event-activity aggregation, latest open reports.
- **Cafes** (`/admin/cafes`): list, create (`/new`), edit (`/[id]/edit`), delete,
  featured flag + rank, editorial tags/amenities. Form warns against entering
  unverifiable ratings/hours.
- **Cafe photos**: upload a rights-cleared image (`/api/admin/upload` →
  `public/uploads`, JPEG/PNG/WebP ≤5 MB) with optional attribution; sets
  `Cafe.photoUrl`. The admin owns the rights to anything uploaded.
- **Ratings**: `rating` / `reviewCount` / `ratingSource` / `priceLevel` are
  admin-entered with a visible source (shown as e.g. "4.8 · Google").
- **Import from OpenStreetMap** (`/admin/import`): one-click import of real cafes
  for a preset city (Overpass API, free, no key). Adds names/locations/websites/
  some amenities & hours; no ratings (OSM has none). Also `npm run db:import`.
- **Sync from Google**: the cafe list has a **Sync** action
  (`POST /api/admin/cafes/[id]/enrich`) and there's a batch `npm run db:enrich`.
  Both pull rating/reviews/price/hours/photo from Google Places **only when
  `GOOGLE_MAPS_API_KEY` is set** — otherwise they return a clear "add a key"
  message and change nothing. See [DATA-SOURCES.md](DATA-SOURCES.md).
- **Reports** (`/admin/reports`): filter by status; resolve / reject / reopen.
- **Users** (`/admin/users`): list with save counts; suspend / unsuspend
  (admins and self are protected).

## Protection
- `/admin/*` gated server-side in `admin/layout.tsx` (`role === ADMIN`, else
  redirect). Every admin API re-checks via `requireAdmin()` — never client-only.
- Admin mutations validated with Zod like all other endpoints.

## Notes / still planned
- **Merge duplicates** UI (the `DUPLICATE` report kind exists; merge tooling is a
  follow-up — today an admin edits/deletes manually).
- Curated recommendation categories management UI (featured flag/rank exist).
- Bulk import from an external provider (behind the places abstraction).

## Analytics access
The admin dashboard surfaces the metrics described in [ANALYTICS.md](ANALYTICS.md).
