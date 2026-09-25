import { describe, it, expect } from "vitest";
import { isAllowedOrigin } from "./origin";

describe("isAllowedOrigin (CSRF)", () => {
  it("allows a missing Origin (non-browser client)", () => {
    expect(isAllowedOrigin(null, "cupscout.app")).toBe(true);
  });

  it("allows same-origin", () => {
    expect(isAllowedOrigin("https://cupscout.app", "cupscout.app")).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000", "localhost:3000")).toBe(true);
  });

  it("blocks a cross-site origin", () => {
    expect(isAllowedOrigin("https://evil.example", "cupscout.app")).toBe(false);
  });

  it("blocks a malformed origin", () => {
    expect(isAllowedOrigin("not a url", "cupscout.app")).toBe(false);
  });

  it("blocks when host is unknown but origin is present", () => {
    expect(isAllowedOrigin("https://cupscout.app", null)).toBe(false);
  });
});
