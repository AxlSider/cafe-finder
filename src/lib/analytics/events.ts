/** Allowed analytics event names. Keep the set small and useful. */
export const ANALYTICS_EVENTS = [
  "search",
  "discover_category",
  "view_cafe",
  "save_cafe",
  "directions",
  "recommend_cafe",
  "recommend_drink",
  "location_denied",
  "out_of_coverage",
  "report_submitted",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
