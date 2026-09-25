import { prisma } from "@/lib/prisma";
import { CafeForm } from "../CafeForm";

export const dynamic = "force-dynamic";

export default async function NewCafePage() {
  const [tags, amenities] = await Promise.all([
    prisma.tag.findMany({ orderBy: { label: "asc" } }),
    prisma.amenity.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">New cafe</h2>
      <CafeForm
        mode="new"
        tagOptions={tags.map((t) => ({ key: t.key, label: t.label }))}
        amenityOptions={amenities.map((a) => ({ key: a.key, label: a.label }))}
      />
    </div>
  );
}
