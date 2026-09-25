import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { cafeInputSchema } from "@/lib/admin/cafeSchema";

async function setJoins(cafeId: string, tags?: string[], amenities?: string[]) {
  if (tags) {
    await prisma.cafeTag.deleteMany({ where: { cafeId } });
    const tagRows = await prisma.tag.findMany({ where: { key: { in: tags } } });
    await prisma.cafeTag.createMany({
      data: tagRows.map((t) => ({ cafeId, tagId: t.id })),
      skipDuplicates: true,
    });
  }
  if (amenities) {
    await prisma.cafeAmenity.deleteMany({ where: { cafeId } });
    const amRows = await prisma.amenity.findMany({ where: { key: { in: amenities } } });
    await prisma.cafeAmenity.createMany({
      data: amRows.map((a) => ({ cafeId, amenityId: a.id })),
      skipDuplicates: true,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;

  const parsed = cafeInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { tags, amenities, website, ...data } = parsed.data;

  const existing = await prisma.cafe.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Guard slug uniqueness if changed.
  if (data.slug !== existing.slug) {
    const clash = await prisma.cafe.findUnique({ where: { slug: data.slug } });
    if (clash) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  await prisma.cafe.update({
    where: { id },
    data: {
      ...data,
      website: website || null,
      photoUrl: data.photoUrl || null,
      googlePlaceId: data.googlePlaceId || null,
    },
  });
  await setJoins(id, tags, amenities);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.cafe.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
