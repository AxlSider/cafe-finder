import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { fetchCafesFromOverpass } from "@/lib/places/import/overpass";
import { applyImportedCafes } from "@/lib/places/import/apply";
import { findArea } from "@/lib/places/import/presets";
import { regionForCoords } from "@/lib/geo";

// Overpass can take a while; allow a longer budget.
export const maxDuration = 60;

const schema = z
  .object({
    place: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    radiusM: z.number().positive().max(15000).optional(),
    locality: z.string().max(120).optional(),
  })
  .refine((v) => v.place || (v.lat != null && v.lng != null), {
    message: "Provide a preset place or lat+lng",
  });

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let center: { lat: number; lng: number };
  let radiusM: number;
  let locality: string;

  if (parsed.data.place) {
    const area = findArea(parsed.data.place);
    if (!area) return NextResponse.json({ error: "Unknown place" }, { status: 400 });
    center = { lat: area.lat, lng: area.lng };
    radiusM = area.radiusM;
    locality = area.label;
  } else {
    center = { lat: parsed.data.lat!, lng: parsed.data.lng! };
    radiusM = parsed.data.radiusM ?? 4000;
    locality = parsed.data.locality ?? "Imported area";
  }

  if (!regionForCoords(center)) {
    return NextResponse.json(
      { error: "That area is outside CupScout's coverage (Luzon + Switzerland)." },
      { status: 400 },
    );
  }

  try {
    const cafes = await fetchCafesFromOverpass(center, radiusM, locality);
    const summary = await applyImportedCafes(cafes);
    return NextResponse.json({ ok: true, ...summary, locality });
  } catch (err) {
    console.error("[/api/admin/import]", err);
    return NextResponse.json(
      { error: "OpenStreetMap import failed. Try again shortly." },
      { status: 502 },
    );
  }
}
