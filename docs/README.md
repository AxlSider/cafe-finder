# CupScout Documentation

This is the documentation system for CupScout. **Docs describe what is
actually implemented.** Where a capability is planned but not yet built, the doc
says so under a **Status** heading — nothing here is aspirational fiction.

## Where to start
- New to the product? → [`PRODUCT.md`](PRODUCT.md)
- Setting it up? → root [`../README.md`](../README.md) + [`ENVIRONMENT.md`](ENVIRONMENT.md)
- Working on the code? → [`../CLAUDE.md`](../CLAUDE.md), [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Curious how honest the data is? → [`DATA-SOURCES.md`](DATA-SOURCES.md)

## Index
| Doc | Contents | Status |
|---|---|---|
| [PRODUCT.md](PRODUCT.md) | Purpose, users, scope, core loop, non-goals | ✅ |
| [FEATURES.md](FEATURES.md) | Every feature, its behavior & edge cases | ✅ |
| [USER-FLOWS.md](USER-FLOWS.md) | Major flows (Mermaid) | ✅ |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Tokens, components, rationale | ✅ |
| [UX-GUIDELINES.md](UX-GUIDELINES.md) | UX principles & required states | ✅ |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Frontend/backend/data flow | ✅ |
| [TECH-STACK.md](TECH-STACK.md) | Technologies & why | ✅ |
| [DATABASE.md](DATABASE.md) | Schema, relationships, ER diagram | ✅ |
| [API.md](API.md) | Internal endpoints | ✅ |
| [DATA-SOURCES.md](DATA-SOURCES.md) | External providers, licensing, integrity | ✅ |
| [AUTHENTICATION.md](AUTHENTICATION.md) | Guest/auth/admin model | ✅ |
| [SECURITY.md](SECURITY.md) | Security posture | ✅ |
| [LOCATION.md](LOCATION.md) | Geolocation, coverage, fallback | ✅ |
| [MAPS.md](MAPS.md) | Map provider, markers, directions | ✅ |
| [RECOMMENDATIONS.md](RECOMMENDATIONS.md) | Ranking & recommendation logic | ✅ |
| [ADMIN.md](ADMIN.md) | Admin capabilities | ✅ |
| [ANALYTICS.md](ANALYTICS.md) | Tracked events | ✅ |
| [PWA.md](PWA.md) | Manifest, install, offline | ✅ |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | A11y approach | ✅ |
| [PERFORMANCE.md](PERFORMANCE.md) | Performance approach | ✅ (baseline) |
| [TESTING.md](TESTING.md) | Tests & critical flows | ✅ |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Build & deploy | ✅ (guide) |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Env variables | ✅ |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common problems | ✅ |
| [CHANGELOG.md](CHANGELOG.md) | Change history | ✅ |
| [DECISIONS.md](DECISIONS.md) | Architecture/product decisions | ✅ |

Legend: ✅ implemented & documented · 🟡 documented design, not fully built.
(As of 0.2.0 nearly everything is built; remaining 🟡 items are noted inside
the relevant docs — e.g. marker clustering, account recovery, E2E tests.)
