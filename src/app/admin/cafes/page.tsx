import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CafeRowActions } from "./CafeRowActions";
import { Star, Plus } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminCafesPage() {
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
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cafes ({cafes.length})</h2>
        <Link href="/admin/cafes/new" className="btn-primary">
          <Plus size={16} /> New cafe
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-faint/20 text-left text-ink-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Region</th>
              <th className="p-3">Locality</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cafes.map((c) => (
              <tr key={c.id} className="border-b border-ink-faint/10">
                <td className="p-3 font-medium text-ink">{c.name}</td>
                <td className="p-3 text-ink-soft">{c.region}</td>
                <td className="p-3 text-ink-soft">{c.locality}</td>
                <td className="p-3 text-ink-soft">
                  {c.rating == null ? "—" : c.rating.toFixed(1)}
                </td>
                <td className="p-3">
                  {c.featured && <Star size={16} filled className="text-brand-500" />}
                </td>
                <td className="p-3">
                  <CafeRowActions id={c.id} slug={c.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
