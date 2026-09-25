# Security

## Status
Auth, sessions, and admin authorization implemented (0.2.0); **Sprint 0 security
baseline done (0.8.0)** — see the threat checklist below. Rate limiting +
moderation are Sprint 1.

## Sprint 0 threat checklist (each verified)
| Area | Control | Verified |
|---|---|---|
| **Admin bootstrap** | No default admin in production; `npm run db:create-admin` + seed **refuse weak/default passwords** (`validateAdminPassword`, ≥12 chars, 3 char-classes, deny-list). Bcrypt cost 12. | CLI rejected `admin12345`; unit tests |
| **Insecure-admin detection** | `/api/health` (production) bcrypt-compares admin hashes to the weak deny-list and returns **503 `adminSecure:false`** if any match. | code + cache |
| **Sessions** | httpOnly + `Secure` (prod) + `SameSite=Lax`; only SHA-256 token **hash** stored; **token rotation on login** (old session deleted); logout invalidates; `revokeAllSessions()` for password change/reset; expiry + suspension enforced. | `session.ts` |
| **Upload safety** | `sharp` decodes (magic-byte validation), enforces a 60 MP decode cap (bomb defense) + 8 MB input, auto-orients, resizes ≤1600px, **re-encodes to WebP which strips ALL EXIF/GPS**, randomized `.webp` filename (non-executable). | real PNG→webp 201; text-as-png→415 |
| **Headers / CSP** | `Content-Security-Policy` (default-src 'self', object-src 'none', frame-ancestors 'none', base-uri/form-action 'self', img https:, fonts allow-listed), HSTS, XCTO, XFO, Referrer-Policy, Permissions-Policy. | header present; app+map render |
| **CSRF** | `src/middleware.ts` blocks mutating `/api/*` when the browser Origin ≠ host (`isAllowedOrigin`); complements SameSite=Lax. Non-browser clients (no Origin) unaffected. | cross-site POST→403; same-origin→200; unit tests |
| **Admin gating** | All 8 `/api/admin/*` routes call `requireAdmin`; `/admin/*` pages gated in `admin/layout.tsx`. | normal user→admin route→403 |
| **IDOR** | Community (rating/photo/amenity), favorites, preferences routes **scope every write to the session `user.id`** via composite keys — no user-supplied id can touch another user's data. | code audit (no user-id param exists) |

**Known follow-ups (not in Sprint 0):** CSP still uses `'unsafe-inline'` for
script/style (inline theme script + Leaflet inline styles) — nonce hardening is
Sprint 4; rate limiting + moderation are Sprint 1; account recovery + email
verification are Sprint 5; location-privacy log scrubbing is Sprint 3.

## In place today
- **Input validation:** every API route validates query/body with **Zod**;
  invalid input → `400` without touching the DB.
- **No secrets in source:** all config via env; `.env` gitignored,
  `.env.example` documents variables. See [ENVIRONMENT.md](ENVIRONMENT.md).
- **Server-only sensitive calls:** geocoding runs server-side only; the client
  never holds provider keys or the geocoder User-Agent.
- **Security headers** (`next.config.mjs`): `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: geolocation=(self), camera=(), microphone=()`.
- **ORM:** Prisma parameterizes queries (SQL-injection resistant).
- **Coverage enforcement** server-side prevents out-of-scope data access.
- **`poweredByHeader` disabled.**

## Auth security (implemented)
- **Password hashing** with bcryptjs (cost 10); plaintext never stored.
- **Sessions:** opaque token; only its SHA-256 hash stored (`Session.tokenHash`);
  `httpOnly` + `SameSite=Lax` cookie (`Secure` in production); expiry +
  suspension enforced in `getCurrentUser`.
- **Authorization:** `ADMIN` role checked **server-side** on every admin route
  and mutation (`requireAdmin`, `admin/layout.tsx`); no client-only gating.
- Login responses avoid revealing whether the email or password was wrong.

## Planned hardening
- **Rate limiting** on auth + reports + uploads + ratings + analytics (Sprint 1).
- **Moderation** of low-trust community uploads (Sprint 1).
- CSP **nonce** to drop `'unsafe-inline'` (Sprint 4); optional 2FA for the admin.

## Reporting/abuse
Reports are unauthenticated by design (low-friction corrections); mitigate spam
with rate limiting + admin triage before any auto-application.
