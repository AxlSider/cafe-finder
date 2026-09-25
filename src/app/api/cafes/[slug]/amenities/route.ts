import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveCafeId } from "@/lib/community";

const schema = z.object({
  amenityKey: z.string().min(1).max(40),
  add: z.boolean(),
});

/**
 * Toggle the signed-in user's confirmation of an amenity at a cafe (e.g. "has
 * Wi-Fi"). Community amenity confirmations are aggregated by count.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { slug } = await params;
  const cafeId = await resolveCafeId(slug);
  if (!cafeId) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const amenity = await prisma.amenity.findUnique({ where: { key: parsed.data.amenityKey } });
  if (!amenity) return NextResponse.json({ error: "Unknown amenity" }, { status: 400 });

  if (parsed.data.add) {
    await prisma.cafeAmenityVote.upsert({
      where: {
        cafeId_amenityId_userId: { cafeId, amenityId: amenity.id, userId: user.id },
      },
      create: { cafeId, amenityId: amenity.id, userId: user.id },
      update: {},
    });
  } else {
    await prisma.cafeAmenityVote
      .delete({
        where: {
          cafeId_amenityId_userId: { cafeId, amenityId: amenity.id, userId: user.id },
        },
      })
      .catch(() => {});
  }

  const count = await prisma.cafeAmenityVote.count({
    where: { cafeId, amenityId: amenity.id },
  });
  return NextResponse.json({ ok: true, amenityKey: parsed.data.amenityKey, count });
}
