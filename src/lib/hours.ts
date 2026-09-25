import type { OpeningHour } from "@/lib/places/types";

/**
 * Open/closed computation. Returns undefined when hours are unknown so the UI
 * can show "Hours unavailable" rather than guessing (data-integrity rule).
 *
 * `now` defaults to the current time. Hours are interpreted in the viewer's
 * local timezone for the foundation; per-cafe timezone handling is a documented
 * follow-up (see docs/RECOMMENDATIONS.md limitations).
 */
export function isOpenNow(
  hours: OpeningHour[] | undefined,
  now: Date = new Date(),
): boolean | undefined {
  if (!hours || hours.length === 0) return undefined;

  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  // Check today's windows plus yesterday's windows that spill past midnight.
  const yesterday = (weekday + 6) % 7;

  for (const h of hours) {
    if (h.weekday === weekday && minutes >= h.opensMin && minutes < h.closesMin) {
      return true;
    }
    // Past-midnight window opened yesterday (closesMin > 1440).
    if (
      h.weekday === yesterday &&
      h.closesMin > 1440 &&
      minutes + 1440 < h.closesMin &&
      minutes + 1440 >= h.opensMin
    ) {
      return true;
    }
  }
  return false;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtMin(min: number): string {
  const m = min % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm.toString().padStart(2, "0")} ${ampm}`;
}

export function formatHourRange(h: OpeningHour): string {
  return `${WEEKDAYS[h.weekday]} ${fmtMin(h.opensMin)} – ${fmtMin(h.closesMin)}`;
}
