import { prisma } from "@/lib/prisma";
import type { ImportedCafe } from "./overpass";

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  outdoor: "Outdoor seating",
  outlets: "Power outlets",
};
const TAG_LABELS: Record<string, string> = {
  specialty: "Specialty Coffee",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "cafe";
}

async function ensureAmenity(key: string) {
  await prisma.amenity.upsert({
    where: { key },
    update: {},
    create: { key, label: AMENITY_LABELS[key] ?? key },
  });
}
async function ensureTag(key: string) {
  await prisma.tag.upsert({
    where: { key },
    update: {},
    create: { key, label: TAG_LABELS[key] ?? key },
  });
}

async function uniqueSlug(name: string, externalPlaceId: string): Promise<string> {
  const base = slugify(name);
  const existing = await prisma.cafe.findUnique({ where: { slug: base } });
  if (!existing) return base;
  // Slug taken — append a short id from the OSM ref to disambiguate.
  const shortId = externalPlaceId.split("/").pop()?.slice(-5) ?? "x";
  return `${base}-${shortId}`;
}

export interface ImportSummary {
  created: number;
  updated: number;
  total: number;
}

/**
 * Upsert imported cafes into the DB. Existing rows are matched by
 * externalPlaceId (OSM id) so re-imports refresh rather than duplicate.
 * Curated cafes (no externalPlaceId) are never touched.
 */
export async function applyImportedCafes(
  cafes: ImportedCafe[],
): Promise<ImportSummary> {
  let created = 0;
  let updated = 0;

  for (const c of cafes) {
    const existing = await prisma.cafe.findFirst({
      where: { externalPlaceId: c.externalPlaceId },
      select: { id: true, photoUrl: true, photoAttribution: true },
    });

    // Never clobber an admin-uploaded photo (/uploads/...). Otherwise use the
    // free OSM/Wikimedia photo when one is available.
    const keepAdminPhoto = existing?.photoUrl?.startsWith("/uploads");
    const photoUrl = keepAdminPhoto ? existing!.photoUrl : c.photoUrl;
    const photoAttribution = keepAdminPhoto
      ? existing!.photoAttribution
      : c.photoAttribution;

    const common = {
      name: c.name,
      region: c.region,
      locality: c.locality,
      address: c.address,
      latitude: c.latitude,
      longitude: c.longitude,
      website: c.website,
      phone: c.phone,
      photoUrl,
      photoAttribution,
      source: "EXTERNAL" as const,
      sourceName: "OpenStreetMap",
      externalPlaceId: c.externalPlaceId,
      lastSyncedAt: new Date(),
      // NOTE: rating/reviewCount deliberately left untouched (OSM has none).
    };

    let cafeId: string;
    if (existing) {
      await prisma.cafe.update({ where: { id: existing.id }, data: common });
      cafeId = existing.id;
      updated++;
    } else {
      const slug = await uniqueSlug(c.name, c.externalPlaceId);
      const cafe = await prisma.cafe.create({ data: { slug, ...common } });
      cafeId = cafe.id;
      created++;
    }

    // Link amenities.
    await prisma.cafeAmenity.deleteMany({ where: { cafeId } });
    for (const key of c.amenities) {
      await ensureAmenity(key);
      const a = await prisma.amenity.findUnique({ where: { key } });
      if (a) await prisma.cafeAmenity.create({ data: { cafeId, amenityId: a.id } }).catch(() => {});
    }
    // Link tags.
    await prisma.cafeTag.deleteMany({ where: { cafeId } });
    for (const key of c.tags) {
      await ensureTag(key);
      const t = await prisma.tag.findUnique({ where: { key } });
      if (t) await prisma.cafeTag.create({ data: { cafeId, tagId: t.id } }).catch(() => {});
    }
    // Hours (only when confidently parsed).
    await prisma.cafeHour.deleteMany({ where: { cafeId } });
    if (c.hours.length > 0) {
      await prisma.cafeHour.createMany({
        data: c.hours.map((h) => ({ cafeId, weekday: h.weekday, opensMin: h.opensMin, closesMin: h.closesMin })),
        skipDuplicates: true,
      });
    }
  }

  return { created, updated, total: cafes.length };
}
