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

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const cafes = await prisma.cafe.findMany({
    orderBy: [{ region: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      region: true,
      locality: true,
      featured: true,
      rating: true,
      source: true,
    },
  });
  return NextResponse.json({ cafes });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const parsed = cafeInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { tags, amenities, website, ...data } = parsed.data;

  const existing = await prisma.cafe.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const cafe = await prisma.cafe.create({
    data: {
      ...data,
      website: website || null,
      photoUrl: data.photoUrl || null,
      googlePlaceId: data.googlePlaceId || null,
      source: "CURATED",
      sourceName: "CupScout curated",
    },
  });
  await setJoins(cafe.id, tags, amenities);

  return NextResponse.json({ cafe: { id: cafe.id, slug: cafe.slug } }, { status: 201 });
}
