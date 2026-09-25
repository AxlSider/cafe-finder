import { describe, it, expect } from "vitest";
import { validateAdminPassword, isKnownWeakPassword } from "./adminSecurity";

describe("validateAdminPassword", () => {
  it("rejects empty / missing", () => {
    expect(validateAdminPassword(undefined).ok).toBe(false);
    expect(validateAdminPassword("").ok).toBe(false);
  });

  it("rejects known defaults (case-insensitive)", () => {
    expect(validateAdminPassword("admin12345").ok).toBe(false);
    expect(validateAdminPassword("Admin12345").ok).toBe(false);
    expect(validateAdminPassword("change-me-please").ok).toBe(false);
    expect(isKnownWeakPassword("password")).toBe(true);
  });

  it("rejects too-short passwords", () => {
    expect(validateAdminPassword("Ab1!xyz").ok).toBe(false); // < 12
  });

  it("rejects low-variety passwords", () => {
    expect(validateAdminPassword("alllowercaseletters").ok).toBe(false); // 1 class
  });

  it("accepts a strong password", () => {
    expect(validateAdminPassword("Ferns!Coffee-92xQ").ok).toBe(true);
  });
});
