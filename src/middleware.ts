import { NextResponse, type NextRequest } from "next/server";
import { isAllowedOrigin } from "@/lib/security/origin";

/**
 * CSRF defense-in-depth (Sprint 0): for state-changing requests to the API,
 * when an Origin header is present it must match the request host. Browsers
 * always send Origin on cross-site POST/PUT/PATCH/DELETE, so a forged
 * cross-site request is rejected; non-browser clients (no Origin, no ambient
 * cookies) are unaffected. This complements the SameSite=Lax session cookie.
 */
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  if (MUTATING.has(req.method) && req.nextUrl.pathname.startsWith("/api/")) {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
