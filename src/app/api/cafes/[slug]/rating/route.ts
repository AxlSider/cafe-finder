import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveCafeId, recomputeCommunityRating } from "@/lib/community";

const schema = z.object({ value: z.number().int().min(1).max(5) });

// Add or update the signed-in user's rating for a cafe.
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
  if (!parsed.success) return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });

  await prisma.cafeRating.upsert({
    where: { cafeId_userId: { cafeId, userId: user.id } },
    create: { cafeId, userId: user.id, value: parsed.data.value },
    update: { value: parsed.data.value },
  });
  const agg = await recomputeCommunityRating(cafeId);
  return NextResponse.json({ ok: true, myRating: parsed.data.value, ...agg });
}

// Remove the user's rating.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { slug } = await params;
  const cafeId = await resolveCafeId(slug);
  if (!cafeId) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  await prisma.cafeRating
    .delete({ where: { cafeId_userId: { cafeId, userId: user.id } } })
    .catch(() => {});
  const agg = await recomputeCommunityRating(cafeId);
  return NextResponse.json({ ok: true, myRating: null, ...agg });
}
