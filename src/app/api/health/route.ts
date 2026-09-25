import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { KNOWN_WEAK_PASSWORDS } from "@/lib/auth/adminSecurity";

/**
 * Health check for load balancers / uptime monitors / deploy platforms.
 * Verifies the process is up and the database is reachable, and (in production)
 * flags if any ADMIN account still uses a known default/weak password.
 */
export const dynamic = "force-dynamic";

let adminSecureCache: { checkedAt: number; secure: boolean } | null = null;

async function adminIsSecure(): Promise<boolean> {
  // Cache for 5 min — bcrypt compares are not free.
  if (adminSecureCache && Date.now() - adminSecureCache.checkedAt < 5 * 60_000) {
    return adminSecureCache.secure;
  }
  let secure = true;
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { passwordHash: true },
    });
    outer: for (const a of admins) {
      for (const weak of KNOWN_WEAK_PASSWORDS) {
        if (await bcrypt.compare(weak, a.passwordHash)) {
          secure = false;
          break outer;
        }
      }
    }
  } catch {
    secure = true; // don't fail health on this check
  }
  adminSecureCache = { checkedAt: Date.now(), secure };
  return secure;
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const body: Record<string, unknown> = { status: "ok", db: "up" };
    if (process.env.NODE_ENV === "production") {
      const secure = await adminIsSecure();
      body.adminSecure = secure;
      if (!secure) {
        body.status = "insecure";
        body.warning = "An admin uses a default/weak password. Run `npm run db:create-admin`.";
        return NextResponse.json(body, { status: 503 });
      }
    }
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ status: "degraded", db: "down" }, { status: 503 });
  }
}
