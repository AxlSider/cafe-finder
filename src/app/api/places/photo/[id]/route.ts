import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveGooglePhotoUri } from "@/lib/places/enrichment";

/**
 * Live proxy for a Google Places photo. Redirects to Google's media URL each
 * request (the API key stays server-side; we do NOT copy/cache the bytes, per
 * Google's caching restrictions). Attribution ("Google") is shown in the UI.
 */
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { googlePhotoName: true },
  });
  if (!cafe?.googlePhotoName) {
    return NextResponse.json({ error: "No photo" }, { status: 404 });
  }
  const uri = await resolveGooglePhotoUri(cafe.googlePhotoName);
  if (!uri) {
    return NextResponse.json({ error: "Photos unavailable" }, { status: 503 });
  }
  // Redirect to the keyless googleusercontent URL (our API key never leaks).
  return NextResponse.redirect(uri, 307);
}
