# Performance

## Goals
Fast first interaction on mobile networks; keep the discovery loop responsive.

## Baseline (foundation build)
- Production build home route: ~**111 kB** First Load JS; shared chunks ~103 kB.
- Cafe detail ~108 kB First Load. (From `next build` output.)

## Implemented
- **Code splitting:** the Leaflet map is `next/dynamic({ ssr:false })`, so its
  JS loads only when a map renders.
- **Server components** for cafe detail/report reduce client JS.
- **DB indexes** on `region`, `(latitude,longitude)`, report `status`, etc.
- **Query caps:** provider `take: 200`; API `limit` bounded ≤ 100.
- **Geocoder caching:** `next: { revalidate: 3600 }` on Nominatim calls to
  respect its rate policy and cut repeat lookups.
- **Debounced** location search input.

## Follow-ups
- Image optimization: cafe photos are null today; when added, use
  `next/image` (remote patterns already configured in `next.config.mjs`).
- Pagination / incremental loading for large result sets.
- Marker clustering for dense maps.
- Service worker caching of the app shell (careful **not** to cache business
  data in a way that shows stale info) — see [PWA.md](PWA.md).
- Add Lighthouse/Web Vitals measurement before further optimizing (measure
  first, don't optimize prematurely).
