"use client";

import type { AnalyticsEventName } from "./events";
import type { Region } from "@/lib/geo";

/**
 * Fire-and-forget client analytics. Uses sendBeacon when available so it doesn't
 * block navigation. Never sends PII (see docs/ANALYTICS.md) — pass only IDs and
 * coarse region.
 */
export function track(
  name: AnalyticsEventName,
  properties?: Record<string, unknown>,
  region?: Region | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ name, properties, region: region ?? null });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* analytics must never break the app */
  }
}
