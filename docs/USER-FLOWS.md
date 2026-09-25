# User Flows

## First visit → discovery
```mermaid
flowchart TD
  A[First visit] --> B[Intro: why location]
  B -->|Use my location| C[Permission prompt]
  B -->|Search location| M[Manual search]
  C -->|granted| D[Reverse geocode + coverage]
  C -->|denied| E[Fallback: manual search]
  M --> D
  E --> M
  D -->|covered| F[Nearby list + map]
  D -->|not covered| G[Coverage message + manual search]
```

## Cafe discovery → details → action
```mermaid
flowchart LR
  F[List/Map] --> H[Select cafe]
  H --> I[Cafe details]
  I --> J[Directions - maps app]
  I --> K[Save]
  I --> L[Report an issue]
```

## Save a cafe (guest)
```mermaid
flowchart TD
  A[Cafe detail] --> B[Tap Save]
  B --> C[Store id in localStorage]
  C --> D[Saved page lists it]
```

## Report incorrect info
```mermaid
flowchart TD
  A[Cafe detail] --> B[Report an issue]
  B --> C[Choose kind + details]
  C --> D[POST /api/reports]
  D --> E[Stored OPEN for admin]
  E --> F[Confirmation]
```

## Navigation & theming (0.3.0)
- **Desktop:** top bar — brand → Discover / Where to go / What to order / Saved,
  plus theme toggle + account.
- **Mobile:** bottom tab bar — Discover / Where / Order / Saved; account + theme
  in the top bar.
- **Theme:** light/dark via the toggle (persisted) or the OS default.
- **Admin:** entered from the account area (admins only); consumer nav is hidden
  under `/admin`.

## Planned flows (design)
- **Account creation / login** — [AUTHENTICATION.md](AUTHENTICATION.md)
- **Drink recommendation ("What should I get?")** — [RECOMMENDATIONS.md](RECOMMENDATIONS.md)
- **Admin: triage reports, edit/merge cafes, curate features** — [ADMIN.md](ADMIN.md)
