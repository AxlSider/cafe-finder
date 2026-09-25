# UX Guidelines

## Principles
1. **Explain before asking.** Never trigger a permission prompt cold.
2. **Show why.** Recommendations carry reasons.
3. **Never lie with the UI.** Missing data is stated, not faked or hidden as a
   blank.
4. **Guest-first.** Core value works without an account.
5. **Predictable interaction.** List and map stay in sync.
6. **No emoji.** Meaning is carried by the SVG icon set, never emoji.
7. **Visual discovery.** Cafe imagery leads; cards are experiences, not records.

## Information hierarchy
Location context → search → discovery categories → results (list/map) → cafe
detail → actions. The current location is always visible while discovering.

## Required states (every data-driven feature)
| State | Example copy |
|---|---|
| Loading | skeleton cards / "Loading map…" |
| Empty | "No cafes found here yet. Try a different search or category." |
| Error | "Something went wrong loading cafes." + **Try again** |
| Permission denied | "Location access was denied. Search for a location instead." |
| Out of coverage | "CupScout currently covers Luzon and Switzerland." |
| Missing data | "Rating unavailable" / "Hours unavailable" / "Menu information isn't available for this cafe yet." |
| Offline | "You're offline. Some information may be unavailable." (`/offline`) |

These are implemented in `DiscoverExperience`, `CafeCard`, the cafe detail page,
and `saved`, with `.skeleton` shimmer for loading.

## Navigation
- **Desktop:** top bar with brand + Discover / Where to go / What to order /
  Saved, plus theme toggle and account.
- **Mobile:** app-style **bottom tab bar** (`MobileTabBar`): Discover / Where /
  Order / Saved. Account + theme live in the top bar.
- **Admin** is separated: consumer nav (top + bottom) is hidden under `/admin`.

## Responsive rules
- Don't just shrink desktop. Mobile uses a segmented **List/Map** control and the
  bottom tab bar; desktop shows list + sticky map side-by-side. Category chips
  scroll horizontally on small screens (`.no-scrollbar`).

## Motion
- Tokens: `ease-spring`, `ease-emphasized`; keyframes `fade-up`, `fade-in`,
  `scale-in`, `sheet-up`, `shimmer`.
- Applied to: card hover lift, recommendation/result reveals, dropdown scale-in,
  button active-press, skeleton shimmer, map marker transitions.
- Performance: transform/opacity only. **All motion respects
  `prefers-reduced-motion`** (globally neutralized in `globals.css`).

## Interaction rules
- Hovering a card highlights its map marker; selecting a marker highlights the
  card and pans the map.
- Filters/categories are toggle chips with `aria-pressed`.
- Search is debounced; location search is restricted to coverage.

## Recommendation UX
Show up to 3 ✓ reason chips per recommended cafe. Never show a raw score.

## Accessibility expectations
Keyboard operable, visible focus, 44px targets, labeled controls, honest error
text tied to inputs. See [ACCESSIBILITY.md](ACCESSIBILITY.md).
