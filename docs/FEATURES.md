# Features

Legend: ✅ built & verified · 🟡 planned/partial.

## ✅ Location-first discovery
- **Purpose:** find cafes near the user.
- **User:** taps "Use my location" (after an explanation) or searches a location.
- **System:** gets coords → reverse-geocodes locality → checks coverage → loads
  nearby cafes.
- **Deps:** `useGeolocation`, `/api/geocode`, `/api/cafes/nearby`.
- **Edge cases:** permission denied → manual search; out of coverage → coverage
  message; geocoder down → still works via coords.

## ✅ Manual location search
- Debounced search restricted to Luzon + Switzerland; selecting a result sets the
  discovery origin. Always available (also as "Change location").

## ✅ Cafe list + map
- Distance-sorted list with honest rating/price/open-now display; interactive
  Leaflet map with user + cafe markers; list↔map hover/select sync; desktop
  side-by-side, mobile toggle.

## ✅ Search, categories, filters, sorting
- Free-text search; category chips (Nearby, Open Now, Highly Rated, Study, Work,
  Date, Specialty, Budget-Friendly, Open Late) mapping to filters/sort;
  ranking/sort in `src/lib/places/ranking.ts`. Only data-backed options act.

## ✅ Cafe details
- Name, locality, rating (or "unavailable"), price, tags, description, address,
  hours, amenities, mini-map, drinks (or "unavailable"), data-source attribution.
- **Actions:** Save, Directions (maps hand-off), Website/Call (when known),
  Report an issue.

## ✅ Guest favorites (Saved)
- Save/unsave cafes as a guest via `localStorage`; **Saved** page lists them.
- **Edge case:** storage blocked → in-memory toggle; empty → friendly CTA.
- Upgrades to server-backed favorites once auth lands.

## ✅ User reporting
- Report wrong location/hours/closed/duplicate/menu/info/photo → stored as `OPEN`
  for the admin. Guest-allowed. `POST /api/reports`.

## ✅ Accounts & auth
- Optional email/password accounts (guest stays the default). bcryptjs hashing,
  hashed session tokens in httpOnly cookies. Guest saves migrate on login.
  See [AUTHENTICATION.md](AUTHENTICATION.md).

## ✅ Server-backed favorites & coffee profile
- Signed-in users' saved cafes persist server-side; `/account` has a coffee
  profile editor that also prefills the drink recommender.

## ✅ "Where should I go?" (`/where`)
- Intent-based cafe recommendations (study/work/date/quiet/…) with explainable
  reason chips, from the transparent scorer.

## ✅ "What should I order?" (`/order`)
- Drink recommendations matched against an honest general drink-type guide (not a
  cafe's menu), with reasons. See [RECOMMENDATIONS.md](RECOMMENDATIONS.md).

## ✅ Admin
- Server-gated `/admin`: dashboard, cafe CRUD + featured, reports triage, user
  suspension. Single admin only. See [ADMIN.md](ADMIN.md).

## ✅ Analytics capture
- `track()` → `/api/analytics`; admin dashboard aggregates. See
  [ANALYTICS.md](ANALYTICS.md).

## ✅ PWA (installable + service worker)
- Manifest + SW with a data-safe caching policy and an `/offline` page. See
  [PWA.md](PWA.md).

## ✅ CupScout brand & design system (0.3.0 redesign)
- Full visual identity (wordmark + mark), token-driven design system, **light &
  dark themes** with a toggle, a professional SVG icon set (**no emoji**),
  photography-first cafe cards, app-style **mobile bottom navigation**, and a
  motion system that respects reduced-motion. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## ✅ Community content (user-generated)
- Signed-in users **rate** cafes (1–5, aggregated + shown as "· Community"),
  **upload photos** (gallery + becomes the card's lead photo), and **confirm
  amenities** (aggregated counts). A distinct, honest USER data category — never
  presented as external data. Admin can moderate/delete photos. See
  [DATA-SOURCES.md](DATA-SOURCES.md).

## 🟡 Planned
- Marker clustering & a mobile bottom-sheet map pattern.
- Password/email change & account recovery.
- Merge-duplicates admin tooling; richer analytics dashboards; E2E tests.
