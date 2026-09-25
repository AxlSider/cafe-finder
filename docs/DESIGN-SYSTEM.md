# Design System — CupScout

The CupScout visual system (v0.3.0 redesign). It's token-driven: colors are CSS
variables (`src/app/globals.css`) surfaced through Tailwind (`tailwind.config.ts`)
so the same class names theme correctly in **light and dark**. The aesthetic is
a modern consumer product — warm amber as the single confident accent on cool
neutral surfaces, **not** an all-brown/beige theme. **No emoji anywhere in the
UI**; a single stroke-based SVG icon set is used instead.

## Brand
- **Name:** CupScout. **Wordmark:** "Cup" in ink + "Scout" in brand amber
  (`Sora`, extra-bold). **Mark:** a location pin fused with a coffee cup —
  scalable from favicon to hero (`src/components/Brand.tsx`,
  `public/icons/icon.svg`).
- Tagline: **"Find your next coffee."**

## Color tokens (RGB channel triplets → `rgb(var(--x) / <alpha>)`)
| Token | Role |
|---|---|
| `brand.50–900` | Amber/caramel roast — primary actions, active states, highlights (`brand-600` = primary button) |
| `accent.400–700` | Fresh teal — success, "open now", specialty, reason pills |
| `surface`, `surface.muted`, `surface.sunken`, `surface.raised` | Backgrounds (cool-warm neutrals) |
| `ink`, `ink.soft`, `ink.muted`, `ink.faint` | 4-step text hierarchy |
| `line` | Hairline borders |
| `success` / `warning` / `danger` | Status |

Light is the default (`:root`); dark applies via `prefers-color-scheme` **or** an
explicit `data-theme` set by the theme toggle. Contrast: body/heading text on
surfaces and white on `brand-600`/`accent-600` meet WCAG AA.

## Typography
- **Display:** `Sora` (600–800) — brand, hero, page/section headings.
- **Text:** `Inter` (400–700) — body, labels, UI.
- Hierarchy comes from family + weight + size, not "everything bold":
  hero `text-3xl/4xl` display; page `text-2xl` display; section uses the
  `.eyebrow` (uppercase, tracked, muted) label; body `text-sm`; meta `text-xs`.

## Spacing, radius, shadow
- Radius: `rounded-full` (buttons/chips), `rounded-xl` (fields), `rounded-card`
  (1rem, cards), `rounded-xl2` (panels).
- Shadow: `shadow-card` (rest), `shadow-pop` (hover), `shadow-float` (overlays).
  Used sparingly — not every element gets a border + shadow.
- Layout width `max-w-content` (76rem); intentional section spacing, avoiding
  empty voids.

## Components (`globals.css`)
| Class | Use |
|---|---|
| `.btn` + `.btn-primary/secondary/ghost/accent` | Pill buttons, ≥44px, spring active-press |
| `.card`, `.panel` | Surfaces |
| `.chip`, `.chip-active`, `.chip-static` | Filter/category pills & static tags |
| `.field` | Inputs (icon-padded) |
| `.reason` | Explainable-recommendation pill (teal, with check icon) |
| `.eyebrow` | Section label |
| `.skeleton` | Shimmer loading placeholder |

## Icons
`src/components/icons.tsx` — one consistent 24px, 1.75-stroke, `currentColor`
set (MapPin, Search, Star, Coffee, Heart, Navigation, Clock, Wifi, Compass,
Sparkle, etc.). `iconByKey` maps category/amenity keys to icons for data-driven
lists. **No emoji.**

## Imagery
`CafePhoto` shows a **real photo when available**; otherwise a branded, tinted
monogram tile (deterministic per cafe) — never a fabricated or stock photo. See
[DATA-SOURCES.md](DATA-SOURCES.md).

## Cards
Three compositions (`CafeCard`): **featured** (image hero + overlay),
**standard** (image + details), **compact** (thumb + minimal meta). Not every
piece of info is a bordered box.

## Map UI
Custom Leaflet `divIcon` markers: amber cafe pins (active = larger/darker), a
teal user-location dot. Controls themed to tokens. See [MAPS.md](MAPS.md).

## Navigation
- **Desktop:** top bar — brand, Discover / Where to go / What to order / Saved,
  theme toggle, account.
- **Mobile:** app-style **bottom tab bar** (Discover / Where / Order / Saved);
  account + theme in the top bar. Admin is fully separated (no consumer chrome).

## Motion
See [UX-GUIDELINES.md](UX-GUIDELINES.md#motion). Timings/easings are tokens
(`ease-spring`, `ease-emphasized`); keyframes `fade-up`, `fade-in`, `scale-in`,
`sheet-up`, `shimmer`. Transform/opacity only; all disabled under
`prefers-reduced-motion`.
