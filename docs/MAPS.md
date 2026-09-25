# Maps

## Provider
- **Rendering:** [Leaflet](https://leafletjs.com/) 1.9 (vanilla, no react-leaflet).
- **Tiles:** **OpenStreetMap standard** raster tiles by default — genuinely free,
  no key, no watermark (`NEXT_PUBLIC_MAP_TILE_URL`). A **CSS filter on the tile
  pane** softens OSM's busy palette in light mode and renders a proper **dark
  map** in dark mode, so the basemap supports rather than overpowers the UI.
- **Cleaner/branded basemap (opt-in):** set a keyed provider (MapTiler, Stadia,
  or CARTO with a free account token) via `NEXT_PUBLIC_MAP_TILE_URL`. Note:
  CARTO's *keyless* basemaps now watermark ("API KEY REQUIRED"), so they are not
  used by default. Any keyed provider is subject to its own terms/approval.

## Framing & behavior
- The map **centers on the origin** (user GPS or searched location) at street
  zoom — never the whole island. It does not refit on every data change.
- **"Search this area":** after the user pans/zooms, a button appears; tapping it
  re-runs discovery centered on the current map center (`onSearchArea`). Results
  are not refreshed on every tiny movement.

## Component
`src/components/CafeMap.tsx` (client-only, loaded via `next/dynamic ssr:false`):
- Initializes the map once, then re-renders a marker layer when data changes.
- **User location** marker (blue dot) + **cafe** markers (coffee pins).
- Uses Leaflet `divIcon` markers so we don't depend on Leaflet's bundled PNG
  marker assets (a common Next.js bundling pitfall).
- **List ↔ map sync:** hovering/selecting a card sets `activeId`; the map pans to
  and highlights that marker, and clicking a marker selects the card.
- Auto-fits bounds to the visible cafes (+ user location).

## Clustering
Not yet implemented. The curated dataset is small enough that clustering isn't
needed. When the dataset grows, add clustering here (e.g. a lightweight grid
cluster) — tracked as a follow-up.

## Directions
We are **not** building a navigation engine. The cafe detail page's **Directions**
button opens the platform's maps app via a universal link:
`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` (opens the
native maps app on mobile, Google Maps on desktop).

## Mobile behavior
- Desktop: list + map side-by-side.
- Mobile: a **List / Map** toggle (bottom-sheet-style patterns are a planned
  enhancement). See [UX-GUIDELINES.md](UX-GUIDELINES.md).

## Provider limitations
- Public OSM tile servers are rate-limited and not meant for heavy production
  traffic — use a managed tile host (or self-host) for production.
- Swapping to Mapbox/Google tiles = change `NEXT_PUBLIC_MAP_TILE_URL` +
  attribution (and honor that provider's terms).
