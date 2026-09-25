import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchLocations, reverseGeocode } from "@/lib/geocode";
import { COVERAGE_MESSAGE } from "@/lib/geo";

/**
 * Geocoding endpoint.
 *   GET /api/geocode?q=baguio           -> manual location search (PH+CH only)
 *   GET /api/geocode?lat=..&lng=..      -> reverse geocode device coords
 */
const schema = z
  .object({
    q: z.string().trim().max(120).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((v) => v.q || (v.lat != null && v.lng != null), {
    message: "Provide either q or lat+lng",
  });

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { q, lat, lng } = parsed.data;

  try {
    if (q) {
      const results = await searchLocations(q);
      return NextResponse.json({ results });
    }
    const result = await reverseGeocode({ lat: lat!, lng: lng! });
    if (!result || result.region === null) {
      return NextResponse.json(
        { result: null, covered: false, message: COVERAGE_MESSAGE },
        { status: 200 },
      );
    }
    return NextResponse.json({ result, covered: true });
  } catch (err) {
    console.error("[/api/geocode]", err);
    return NextResponse.json(
      { error: "Location lookup is unavailable right now." },
      { status: 502 },
    );
  }
}
