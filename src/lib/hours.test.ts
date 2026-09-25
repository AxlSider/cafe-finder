import { describe, it, expect } from "vitest";
import { isOpenNow } from "./hours";
import type { OpeningHour } from "./places/types";

// Wednesday 2024-01-03, 10:00 local.
const wed10 = new Date(2024, 0, 3, 10, 0);

describe("isOpenNow", () => {
  it("returns undefined when hours are unknown", () => {
    expect(isOpenNow(undefined, wed10)).toBeUndefined();
    expect(isOpenNow([], wed10)).toBeUndefined();
  });

  it("is open within a same-day window", () => {
    const hours: OpeningHour[] = [
      { weekday: 3, opensMin: 8 * 60, closesMin: 18 * 60 },
    ];
    expect(isOpenNow(hours, wed10)).toBe(true);
  });

  it("is closed outside the window", () => {
    const hours: OpeningHour[] = [
      { weekday: 3, opensMin: 12 * 60, closesMin: 18 * 60 },
    ];
    expect(isOpenNow(hours, wed10)).toBe(false);
  });

  it("handles a past-midnight window from the previous day", () => {
    // Tue open until 02:00 (26:00). Check Wed 01:00.
    const wed1am = new Date(2024, 0, 3, 1, 0);
    const hours: OpeningHour[] = [
      { weekday: 2, opensMin: 20 * 60, closesMin: 26 * 60 },
    ];
    expect(isOpenNow(hours, wed1am)).toBe(true);
  });
});
