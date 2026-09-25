import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cafeRowToSummary } from "@/lib/places/map";

const cafeInclude = {
  hours: true,
  tags: { include: { tag: true } },
  amenities: { include: { amenity: true } },
} as const;

// GET -> saved cafe summaries for the current user.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const favorites = await prisma.favoriteCafe.findMany({
    where: { userId: user.id },
    include: { cafe: { include: cafeInclude } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    cafes: favorites.map((f) => cafeRowToSummary(f.cafe)),
  });
}

const bodySchema = z.object({ cafeId: z.string().min(1) });

// POST -> save a cafe.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const cafe = await prisma.cafe.findFirst({
    where: { OR: [{ id: parsed.data.cafeId }, { slug: parsed.data.cafeId }] },
    select: { id: true },
  });
  if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  await prisma.favoriteCafe.upsert({
    where: { userId_cafeId: { userId: user.id, cafeId: cafe.id } },
    create: { userId: user.id, cafeId: cafe.id },
    update: {},
  });
  return NextResponse.json({ ok: true, saved: true }, { status: 201 });
}

// DELETE ?cafeId= -> unsave.
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const cafeId = req.nextUrl.searchParams.get("cafeId");
  if (!cafeId) return NextResponse.json({ error: "Missing cafeId" }, { status: 400 });

  const cafe = await prisma.cafe.findFirst({
    where: { OR: [{ id: cafeId }, { slug: cafeId }] },
    select: { id: true },
  });
  if (cafe) {
    await prisma.favoriteCafe
      .delete({ where: { userId_cafeId: { userId: user.id, cafeId: cafe.id } } })
      .catch(() => {});
  }
  return NextResponse.json({ ok: true, saved: false });
}
