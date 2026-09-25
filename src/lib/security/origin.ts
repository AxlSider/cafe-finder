/**
 * Origin allow-list for CSRF defense (Sprint 0). Pure + tested; used by
 * `src/middleware.ts`. When a browser sends an Origin on a mutating request it
 * must match the request host; a missing Origin (non-browser client) is allowed
 * since it carries no ambient cookies.
 */
export function isAllowedOrigin(
  origin: string | null,
  host: string | null,
): boolean {
  if (!origin) return true; // non-browser client — no CSRF risk
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
