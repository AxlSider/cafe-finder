import bcrypt from "bcryptjs";

/**
 * Password hashing. bcryptjs is pure-JS (no native build) — safe on Windows/XAMPP.
 * Cost 10 is a reasonable dev/prod baseline. See docs/AUTHENTICATION.md.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
