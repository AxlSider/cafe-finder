# AGENTS.md — repository rules & workflow

This file is for any automated/AI contributor. It overlaps intentionally with
`CLAUDE.md`; keep them consistent.

## Workflow
1. Read `CLAUDE.md` and the relevant `docs/*.md` before changing code.
2. Make the change in small, coherent slices.
3. Run `npm run typecheck` and `npm test` before considering work done.
4. Update docs + `docs/CHANGELOG.md` (and `docs/DECISIONS.md` for decisions).

## Coding conventions
- TypeScript strict, `@/*` path alias, functional React components.
- Validate all external input (API bodies/queries) with Zod.
- Keep the places-provider abstraction intact (`src/lib/places`).
- Presentational components stay dumb; data-fetching lives in routes/hooks.

## Testing requirements
- Pure domain logic (`geo`, `hours`, `ranking`) must have Vitest coverage.
- Don't mark a feature "done" because a page renders — exercise the states
  (loading / empty / error / denied / missing-data) listed in `docs/UX-GUIDELINES.md`.

## Security requirements
- No secrets in source; everything via env (`docs/ENVIRONMENT.md`).
- Server-only modules (Prisma, geocoding) must never be imported into client
  components.
- Admin routes (when added) must be authorization-gated server-side.

## Documentation requirements
- Docs describe what is **actually implemented**. Never document unbuilt
  features as if they exist; mark them "Planned".

## Design requirements (0.3.0 — CupScout)
- No emoji in the UI — use `src/components/icons.tsx`.
- Use design tokens (Tailwind color classes → CSS variables); everything must
  work in light AND dark. No hardcoded hex in components.
- Photography-first cards; never fabricate/stock a cafe photo — use `CafePhoto`.
- Keep admin visually separated from the consumer experience.
- Full reference: `docs/DESIGN-SYSTEM.md`, `docs/UX-GUIDELINES.md`.

## Forbidden shortcuts
- Fabricating ratings/reviews/hours/menus/prices/photos to fill the UI.
- Widening geographic coverage beyond Luzon + Switzerland.
- Adding cafe-owner/merchant roles.
- Calling Nominatim (or other keyed providers) from the client.
- Committing `.env` or hardcoding provider keys.
- Using emoji or arbitrary hardcoded colors in the UI.
