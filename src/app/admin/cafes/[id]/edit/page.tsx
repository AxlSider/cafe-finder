import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CafeForm, type CafeFormValues } from "../../CafeForm";
import { PhotoModeration } from "./PhotoModeration";

export const dynamic = "force-dynamic";

export default async function EditCafePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cafe, tags, amenities, photos] = await Promise.all([
    prisma.cafe.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        amenities: { include: { amenity: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { label: "asc" } }),
    prisma.amenity.findMany({ orderBy: { label: "asc" } }),
    prisma.cafePhoto.findMany({
      where: { cafeId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true },
    }),
  ]);

  if (!cafe) notFound();

  const initial: Partial<CafeFormValues> = {
    name: cafe.name,
    slug: cafe.slug,
    region: cafe.region,
    locality: cafe.locality,
    address: cafe.address ?? "",
    latitude: String(cafe.latitude),
    longitude: String(cafe.longitude),
    rating: cafe.rating != null ? String(cafe.rating) : "",
    reviewCount: cafe.reviewCount != null ? String(cafe.reviewCount) : "",
    priceLevel: cafe.priceLevel ?? "",
    phone: cafe.phone ?? "",
    website: cafe.website ?? "",
    description: cafe.description ?? "",
    ratingSource: cafe.ratingSource ?? "",
    photoUrl: cafe.photoUrl ?? "",
    photoAttribution: cafe.photoAttribution ?? "",
    googlePlaceId: cafe.googlePlaceId ?? "",
    featured: cafe.featured,
    featuredRank: cafe.featuredRank != null ? String(cafe.featuredRank) : "",
    tags: cafe.tags.map((t) => t.tag.key),
    amenities: cafe.amenities.map((a) => a.amenity.key),
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Edit: {cafe.name}</h2>
      <CafeForm
        mode="edit"
        id={cafe.id}
        initial={initial}
        tagOptions={tags.map((t) => ({ key: t.key, label: t.label }))}
        amenityOptions={amenities.map((a) => ({ key: a.key, label: a.label }))}
      />

      <section className="card space-y-3 p-5">
        <h3 className="font-semibold">Community photos ({photos.length})</h3>
        <p className="text-sm text-ink-muted">Remove any inappropriate uploads.</p>
        <PhotoModeration photos={photos} />
      </section>
    </div>
  );
}
