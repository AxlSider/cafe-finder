# Authentication

## Status: implemented (0.2.0)
Guest browsing is fully functional; accounts are **optional** and add
persistence/personalization. Implemented in `src/lib/auth/*`, `src/app/api/auth/*`,
`AuthProvider`, and the login/register/account pages.

## Roles
- **Guest** (no account): search, discover, maps, view cafes, view available
  ratings, general recommendations, guest saves (localStorage), submit reports.
- **User** (`Role.USER`): server-backed favorites (cafes + drinks), coffee
  profile, personalized recommendations, recent activity.
- **Admin** (`Role.ADMIN`): the single platform administrator (see
  [ADMIN.md](ADMIN.md)). **No** merchant/owner role exists.

## Mechanism (as built)
- **Registration/login** with email + password (`/api/auth/register`, `/login`).
- **Password hashing:** bcryptjs (cost 10); only the hash is stored.
- **Sessions:** random 32-byte token in an `httpOnly` + `SameSite=Lax` cookie
  (`Secure` in production); only the **SHA-256 hash** is persisted
  (`Session.tokenHash`); `getCurrentUser` checks expiry + suspension.
- **Authorization:** `requireAdmin()` verifies `role === ADMIN` server-side on
  every admin route/mutation; `/admin/*` is gated in `admin/layout.tsx`.
- **Guest → user migration:** on login/register, localStorage saves are POSTed
  to `/api/favorites/cafes` then cleared (`LoginForm.migrateGuestSaves`).

## Still planned
- **Recovery:** email-based password reset (needs an email provider).
- Password/email change UI; optional social login.

## Non-goals
- No social login required for MVP.
- No forced registration to browse.
