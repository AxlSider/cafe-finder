import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReportActions } from "./ReportActions";

export const dynamic = "force-dynamic";

const STATUSES = ["OPEN", "RESOLVED", "REJECTED"] as const;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : "OPEN";

  const reports = await prisma.report.findMany({
    where: { status: filter },
    include: { cafe: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Reports</h2>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/reports?status=${s}`}
              className={`chip ${filter === s ? "chip-active" : ""}`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card p-6 text-center text-ink-muted">
          No {filter.toLowerCase()} reports.
        </div>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    <Link href={`/cafes/${r.cafe.slug}`} className="hover:underline">
                      {r.cafe.name}
                    </Link>{" "}
                    <span className="chip ml-1 align-middle capitalize">
                      {r.kind.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </p>
                  {r.details && <p className="mt-1 text-sm text-ink-soft">{r.details}</p>}
                  <p className="mt-1 text-xs text-ink-muted">
                    {r.createdAt.toLocaleString()}
                  </p>
                </div>
                <ReportActions id={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
