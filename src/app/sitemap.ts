import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Sitemap: static routes + every cafe detail page, so search engines can index
 * the full catalogue. Regenerated on request (data changes as cafes are added).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/app",
    "/where",
    "/order",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  let cafeRoutes: MetadataRoute.Sitemap = [];
  try {
    const cafes = await prisma.cafe.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
    cafeRoutes = cafes.map((c) => ({
      url: `${BASE}/cafes/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build/request — still return the static routes.
  }

  return [...staticRoutes, ...cafeRoutes];
}
