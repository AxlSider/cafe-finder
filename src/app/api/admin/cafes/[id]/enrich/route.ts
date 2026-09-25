import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { enrichCafe } from "@/lib/places/applyEnrichment";

/**
 * Admin action: enrich one cafe from the external provider (Google Places).
 * Returns a clear message when no provider key is configured.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const outcome = await enrichCafe(id);

  if (!outcome.ok) {
    if (outcome.reason === "no_provider") {
      return NextResponse.json(
        {
          error:
            "No provider key configured. Set FOURSQUARE_API_KEY (free) or GOOGLE_MAPS_API_KEY in .env to enable rating/photo enrichment.",
        },
        { status: 501 },
      );
    }
    if (outcome.reason === "not_found") {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Enrichment failed. Try again." }, { status: 502 });
  }

  if (!outcome.matched) {
    return NextResponse.json(
      {
        ok: true,
        matched: false,
        message:
          "No enrichment data returned. The place wasn't matched, or ratings/photos need provider credits (Foursquare/Google premium fields are paid).",
      },
      { status: 200 },
    );
  }
  return NextResponse.json({ ok: true, matched: true, source: outcome.ratingSource });
}
