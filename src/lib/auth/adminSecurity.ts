/**
 * Admin credential security helpers (Sprint 0).
 * Used by the admin bootstrap CLI and the seed to refuse weak/default admin
 * passwords, and by the health check to surface an insecure default admin.
 */

// Known-weak/default passwords that must never protect an admin account,
// especially in production. Kept lowercase for case-insensitive comparison.
export const KNOWN_WEAK_PASSWORDS = new Set([
  "admin",
  "admin12345",
  "admin123",
  "password",
  "password123",
  "changeme",
  "change-me",
  "change-me-please",
  "letmein",
  "cupscout",
  "12345678",
  "qwerty123",
]);

export interface PasswordCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Validate an admin password. Requires ≥12 chars with some variety and rejects
 * known defaults. This is intentionally strict — the admin can do anything.
 */
export function validateAdminPassword(pw: string | undefined | null): PasswordCheck {
  if (!pw) return { ok: false, reason: "Password is required." };
  if (KNOWN_WEAK_PASSWORDS.has(pw.trim().toLowerCase())) {
    return { ok: false, reason: "That is a known default/weak password." };
  }
  if (pw.length < 12) {
    return { ok: false, reason: "Use at least 12 characters." };
  }
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (classes < 3) {
    return {
      ok: false,
      reason: "Mix at least 3 of: lowercase, uppercase, numbers, symbols.",
    };
  }
  return { ok: true };
}

export function isKnownWeakPassword(pw: string | undefined | null): boolean {
  return !!pw && KNOWN_WEAK_PASSWORDS.has(pw.trim().toLowerCase());
}
