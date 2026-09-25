import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [cafeCount, userCount, openReports, drinkTypes, topEvents, recentReports] =
    await Promise.all([
      prisma.cafe.count(),
      prisma.user.count(),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.drinkType.count(),
      prisma.analyticsEvent.groupBy({
        by: ["name"],
        _count: { name: true },
        orderBy: { _count: { name: "desc" } },
        take: 8,
      }),
      prisma.report.findMany({
        where: { status: "OPEN" },
        include: { cafe: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Cafes", value: cafeCount, href: "/admin/cafes" },
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Open reports", value: openReports, href: "/admin/reports" },
    { label: "Drink types", value: drinkTypes, href: "/order" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 hover:shadow-pop">
            <p className="text-3xl font-bold text-ink">{s.value}</p>
            <p className="text-sm text-ink-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Event activity</h2>
          {topEvents.length === 0 ? (
            <p className="text-sm text-ink-muted">No analytics events yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {topEvents.map((e) => (
                <li key={e.name} className="flex justify-between">
                  <span className="text-ink-soft">{e.name}</span>
                  <span className="font-medium">{e._count.name}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            See docs/ANALYTICS.md for the tracked event catalog.
          </p>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Latest open reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-sm text-ink-muted">No open reports.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentReports.map((r) => (
                <li key={r.id} className="flex justify-between gap-2">
                  <span className="truncate text-ink-soft">
                    {r.cafe.name} — {r.kind.replace(/_/g, " ").toLowerCase()}
                  </span>
                  <Link href="/admin/reports" className="text-brand-700 underline">
                    review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
