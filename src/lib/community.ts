import { prisma } from "@/lib/prisma";

/** Resolve a cafe slug-or-id to its id (or null). */
export async function resolveCafeId(slugOrId: string): Promise<string | null> {
  const cafe = await prisma.cafe.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: { id: true },
  });
  return cafe?.id ?? null;
}

/**
 * Recompute a cafe's denormalized community rating (average + count) from its
 * user ratings. Called after any rating change.
 */
export async function recomputeCommunityRating(cafeId: string): Promise<{
  communityRating: number | null;
  communityRatingCount: number;
}> {
  const agg = await prisma.cafeRating.aggregate({
    where: { cafeId },
    _avg: { value: true },
    _count: { value: true },
  });
  const count = agg._count.value;
  const avg = count > 0 ? Math.round((agg._avg.value ?? 0) * 10) / 10 : null;
  await prisma.cafe.update({
    where: { id: cafeId },
    data: { communityRating: avg, communityRatingCount: count },
  });
  return { communityRating: avg, communityRatingCount: count };
}
