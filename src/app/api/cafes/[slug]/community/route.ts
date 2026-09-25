import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveCafeId } from "@/lib/community";

/**
 * Community snapshot for a cafe: aggregate rating, visible photo gallery,
 * amenity confirmations (with counts), and — if signed in — the viewer's own
 * rating and amenity votes so the UI can reflect their contributions.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cafeId = await resolveCafeId(slug);
  if (!cafeId) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });

  const user = await getCurrentUser();

  const [cafe, photos, amenityVotes, myRating, myVotes] = await Promise.all([
    prisma.cafe.findUnique({
      where: { id: cafeId },
      select: { communityRating: true, communityRatingCount: true },
    }),
    prisma.cafePhoto.findMany({
      where: { cafeId, hidden: false },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, url: true },
    }),
    prisma.cafeAmenityVote.groupBy({
      by: ["amenityId"],
      where: { cafeId },
      _count: { userId: true },
    }),
    user
      ? prisma.cafeRating.findUnique({
          where: { cafeId_userId: { cafeId, userId: user.id } },
          select: { value: true },
        })
      : Promise.resolve(null),
    user
      ? prisma.cafeAmenityVote.findMany({
          where: { cafeId, userId: user.id },
          select: { amenityId: true },
        })
      : Promise.resolve([]),
  ]);

  // Map amenity vote counts by key.
  const amenityRows = await prisma.amenity.findMany();
  const keyById = Object.fromEntries(amenityRows.map((a) => [a.id, a.key]));
  const amenityCounts: Record<string, number> = {};
  for (const v of amenityVotes) {
    const key = keyById[v.amenityId];
    if (key) amenityCounts[key] = v._count.userId;
  }
  const myAmenityKeys = (myVotes as { amenityId: string }[])
    .map((v) => keyById[v.amenityId])
    .filter(Boolean);

  return NextResponse.json({
    isAuthed: Boolean(user),
    communityRating: cafe?.communityRating ?? null,
    communityRatingCount: cafe?.communityRatingCount ?? 0,
    myRating: (myRating as { value: number } | null)?.value ?? null,
    photos,
    amenityCounts,
    myAmenityKeys,
  });
}
