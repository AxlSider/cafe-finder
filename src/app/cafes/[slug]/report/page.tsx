import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlacesProvider } from "@/lib/places";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Report an issue" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = await getPlacesProvider().getCafe(slug);
  if (!cafe) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold">Report an issue</h1>
        <p className="text-ink-muted">
          Help us keep {cafe.name} accurate. Reports go to our team for review.
        </p>
      </div>
      <ReportForm cafeId={cafe.id} cafeName={cafe.name} slug={cafe.slug} />
    </div>
  );
}
