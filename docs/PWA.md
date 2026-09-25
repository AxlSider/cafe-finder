# PWA

## Status: implemented (0.2.0)
Installable manifest **and** a service worker with a data-integrity-safe caching
policy are in place.

## In place
- **Manifest:** `public/manifest.webmanifest` — name, `display: standalone`,
  theme/background colors, and an SVG app icon (`public/icons/icon.svg`).
  Linked via Next metadata (`manifest`, `appleWebApp`) and `themeColor` viewport.
- **Service worker:** `public/sw.js`, registered in **production only** by
  `ServiceWorkerRegister` (avoids caching noise in dev). Strategy:
  - **Cache-first** for immutable static assets (`/_next/static`, `/icons/`).
  - **Network-first** for navigations, falling back to cache then `/offline`.
  - **Network-only for `/api/*`** — business data is never cached, so we never
    show stale ratings/hours/menus (the data-integrity rule drives this).
  - Cross-origin requests (map tiles, geocoder) are left untouched.
- **Offline page:** `/offline` — "You're offline. Some information may be
  unavailable."
- Responsive, mobile-first UI.

## Still planned
- Raster PNG icons (192/512) alongside the SVG for broader install support.
- An in-app "update available" prompt when a new SW version activates.
