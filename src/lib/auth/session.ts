import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Session management.
 * - A random opaque token is set in an httpOnly cookie.
 * - Only the SHA-256 hash of the token is stored (Session.tokenHash), so a DB
 *   leak doesn't expose usable session tokens.
 * See docs/AUTHENTICATION.md and docs/SECURITY.md.
 */

const COOKIE = "cf_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();

  // Token rotation: if this browser already holds a session, invalidate it so a
  // fresh login always issues a new token and never reuses a fixed one
  // (session-fixation defense).
  const existing = store.get(COOKIE)?.value;
  if (existing) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(existing) } })
      .catch(() => {});
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + MAX_AGE_SEC * 1000);

  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });

  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

/**
 * Invalidate ALL sessions for a user (e.g. on password change/reset or
 * "log out everywhere"). See Sprint 5 (password reset).
 */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } }).catch(() => {});
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  store.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.suspended) return null;

  const { id, email, displayName, role } = session.user;
  return { id, email, displayName, role };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
