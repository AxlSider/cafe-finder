import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPlacesProvider } from "@/lib/places";
import { regionForCoords, isCovered, COVERAGE_MESSAGE } from "@/lib/geo";
import type { NearbyQuery, PriceLevel } from "@/lib/places/types";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  region: z.enum(["LUZON", "SWITZERLAND"]).optional(),
  q: z.string().trim().max(120).optional(),
  radiusKm: z.coerce.number().positive().max(50).optional(),
  openNow: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  price: z.string().optional(), // comma-separated BUDGET,MODERATE,EXPENSIVE
  tags: z.string().optional(),
  amenities: z.string().optional(),
  sort: z
    .enum(["recommended", "distance", "rating", "reviews", "price"])
    .optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

function splitCsv(v?: string): string[] | undefined {
  if (!v) return undefined;
  const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const p = parsed.data;

  const origin =
    p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : undefined;

  // Coverage enforcement at the API boundary (not only UI).
  let region = p.region;
  if (origin) {
    if (!isCovered(origin)) {
      return NextResponse.json(
        { error: COVERAGE_MESSAGE, covered: false, cafes: [] },
        { status: 200 },
      );
    }
    region = region ?? regionForCoords(origin) ?? undefined;
  }

  // Nearby semantics: with an origin and no free-text search, results are
  // constrained to a real radius (default 5 km) so a cafe 150 km away never
  // shows as "nearby". The client expands the radius explicitly (5→10→25→50).
  // A text search (q) searches the whole covered region instead.
  const isTextSearch = Boolean(p.q?.trim());
  const radiusKm =
    p.radiusKm ?? (origin && !isTextSearch ? 5 : undefined);

  const query: NearbyQuery = {
    origin,
    region,
    q: p.q,
    radiusKm,
    openNow: p.openNow,
    minRating: p.minRating,
    priceLevels: splitCsv(p.price) as PriceLevel[] | undefined,
    tags: splitCsv(p.tags),
    amenities: splitCsv(p.amenities),
    sort: p.sort,
    limit: p.limit,
  };

  try {
    const provider = getPlacesProvider();
    const cafes = await provider.searchNearby(query);
    return NextResponse.json({
      covered: true,
      cafes,
      radiusKm: radiusKm ?? null,
      maxRadiusKm: 50,
    });
  } catch (err) {
    console.error("[/api/cafes/nearby]", err);
    return NextResponse.json(
      {
        error: "Could not load cafes right now.",
        detail: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      },
      { status: 500 },
    );
  }
}
