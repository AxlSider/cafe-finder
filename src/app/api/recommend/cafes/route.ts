import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPlacesProvider } from "@/lib/places";
import { scoreCafe } from "@/lib/places/ranking";
import { regionForCoords, isCovered, COVERAGE_MESSAGE } from "@/lib/geo";
import type { NearbyQuery } from "@/lib/places/types";

/**
 * "Where should I go?" — returns cafes ranked for an intent, each with the
 * explainable reasons from the transparent scorer.
 */
const schema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  region: z.enum(["LUZON", "SWITZERLAND"]).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional(),
  tags: z.string().optional(), // csv of purpose tags
  openNow: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const p = parsed.data;
  const origin = p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : undefined;

  let region = p.region;
  if (origin) {
    if (!isCovered(origin)) {
      return NextResponse.json({ covered: false, error: COVERAGE_MESSAGE, recommendations: [] });
    }
    region = region ?? regionForCoords(origin) ?? undefined;
  }

  const tags = p.tags?.split(",").map((s) => s.trim()).filter(Boolean);
  const query: NearbyQuery = {
    origin,
    region,
    tags,
    openNow: p.openNow,
    // Intent-based exploration: default to a 25 km catchment so results stay
    // realistically reachable rather than region-wide.
    radiusKm: origin ? (p.radiusKm ?? 25) : undefined,
    sort: "recommended",
    limit: p.limit ?? 20,
  };

  try {
    const cafes = await getPlacesProvider().searchNearby(query);
    const recommendations = cafes.map((cafe) => {
      const { reasons } = scoreCafe(cafe, query);
      return { cafe, reasons };
    });
    return NextResponse.json({ covered: true, recommendations });
  } catch (err) {
    console.error("[/api/recommend/cafes]", err);
    return NextResponse.json({ error: "Could not load recommendations." }, { status: 500 });
  }
}
