# Analytics

## Status: implemented (0.2.0)
The `AnalyticsEvent` table (`name`, `properties` JSON, `region`, `createdAt`) is
populated via `track()` (client, `src/lib/analytics/client.ts`, using
`navigator.sendBeacon`) → `/api/analytics` → `recordEvent` (server). The event
name set is enforced in `src/lib/analytics/events.ts`. The admin dashboard
aggregates counts by event name.

## Events
| Event `name` | Properties | Where fired |
|---|---|---|
| `search` | `{ q }` + region | Discover search submit |
| `discover_category` | `{ category }` | Category chip select |
| `view_cafe` | `{ cafeId }` + region | Cafe detail (server-side) |
| `save_cafe` | `{ cafeId }` + region | Save action |
| `directions` | `{ cafeId }` + region | Directions click |
| `recommend_cafe` | `{ intents }` | "Where should I go?" |
| `recommend_drink` | `{ prefs }` | "What should I order?" |
| `location_denied` | `{}` | Geolocation denied |
| `out_of_coverage` | `{}` | Origin outside coverage |
| `report_submitted` | `{ kind }` | Report submitted |

## Metrics for the admin
Searches, popular locations, viewed cafes, saved cafes, popular drinks, category
usage, recommendation interactions, search terms, user growth.

## Privacy considerations
- **No PII in event properties.** Store cafe IDs and coarse region, not user
  identity or coordinates.
- No cross-site tracking; first-party only.
- Respect Do-Not-Track where feasible; aggregate for the admin, don't profile.
- Keep the event set **useful, not bloated** (product principle).
