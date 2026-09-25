import { curatedProvider } from "./curated";
import type { PlacesProvider } from "./types";

/**
 * Provider factory. Swapping data sources is a config change, not a code change.
 * Add "google" / "mapbox" implementations here when/if keys are provisioned.
 * See docs/DATA-SOURCES.md and docs/DECISIONS.md.
 */
export function getPlacesProvider(): PlacesProvider {
  // Default to "curated" when unset OR blank. On some hosts (e.g. Vercel) an
  // undeclared env var arrives as "" rather than undefined, which `??` misses.
  const provider = (process.env.PLACES_PROVIDER ?? "").trim() || "curated";
  switch (provider) {
    case "curated":
      return curatedProvider;
    default:
      // Fail loud rather than silently returning wrong data.
      throw new Error(
        `Unknown PLACES_PROVIDER "${provider}". Supported: curated.`,
      );
  }
}

export * from "./types";
