import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlacesProvider } from "@/lib/places";
import { CafeActions } from "@/components/CafeActions";
import { CafeDetailMap } from "@/components/CafeDetailMap";
import { CafePhoto } from "@/components/CafePhoto";
import { CafeContribute } from "@/components/CafeContribute";
import { formatHourRange } from "@/lib/hours";
import { formatMoney, priceLevelWords, ratingLabel } from "@/lib/format";
import { recordEvent } from "@/lib/analytics/server";
import {
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  iconByKey,
  Coffee,
} from "@/components/icons";

export const dynamic = "force-dynamic";

async function getCafe(slug: string) {
  return getPlacesProvider().getCafe(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cafe = await getCafe(slug);
  if (!cafe) return { title: "Cafe not found" };
  return {
    title: cafe.name,
    description: cafe.description ?? `${cafe.name} in ${cafe.locality} — on CupScout.`,
  };
}

export default async function CafePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = await getCafe(slug);
  if (!cafe) notFound();

  void recordEvent("view_cafe", { cafeId: cafe.id }, cafe.region);

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ChevronLeft size={16} /> Discover
      </Link>

      {/* Hero */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-card sm:aspect-[21/9]">
        <CafePhoto name={cafe.name} photoUrl={cafe.photoUrl} photoAlt={cafe.photoAlt} rounded="" eager />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <div className="flex items-center gap-2">
            {cafe.openNow !== undefined && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  cafe.openNow ? "bg-accent-500 text-white" : "bg-white/20 text-white"
                }`}
              >
                {cafe.openNow ? "Open now" : "Closed"}
              </span>
            )}
            {cafe.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium capitalize backdrop-blur">
                {t.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            {cafe.name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} /> {cafe.locality}
            </span>
            <span className="inline-flex items-center gap-1">
              {cafe.rating == null ? (
                "Rating unavailable"
              ) : (
                <>
                  <Star size={15} filled className="text-brand-300" />
                  {ratingLabel(cafe.rating, cafe.reviewCount)}
                  {cafe.ratingSource && (
                    <span className="text-white/70">· {cafe.ratingSource}</span>
                  )}
                </>
              )}
            </span>
            <span>{priceLevelWords(cafe.priceLevel)}</span>
          </div>
        </div>
      </div>

      <CafeActions cafe={cafe} />

      {cafe.description && (
        <section>
          <h2 className="eyebrow mb-1.5">About</h2>
          <p className="max-w-prose text-ink-soft">{cafe.description}</p>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-6">
          <Detail icon={<MapPin size={16} />} title="Address">
            {cafe.address ?? <span className="text-ink-muted">Address unavailable</span>}
          </Detail>

          <Detail icon={<Clock size={16} />} title="Opening hours">
            {cafe.hours.length === 0 ? (
              <span className="text-ink-muted">Hours unavailable</span>
            ) : (
              <ul className="space-y-0.5">
                {cafe.hours.map((h, i) => (
                  <li key={i}>{formatHourRange(h)}</li>
                ))}
              </ul>
            )}
          </Detail>

          <div>
            <h2 className="eyebrow mb-2">Amenities</h2>
            {cafe.amenities.length === 0 ? (
              <span className="text-ink-muted">No amenity info yet</span>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {cafe.amenities.map((a) => {
                  const Icon = iconByKey[a] ?? Coffee;
                  return (
                    <li key={a} className="chip-static capitalize">
                      <Icon size={14} /> {a}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="eyebrow mb-2">Location</h2>
          <CafeDetailMap cafe={cafe} />
          {cafe.source === "CURATED" && (
            <p className="mt-2 text-xs text-ink-muted">
              Location is an approximate curated position.{" "}
              <Link href={`/cafes/${cafe.slug}/report`} className="underline">
                Report an error
              </Link>
              .
            </p>
          )}
        </section>
      </div>

      <section className="rounded-card border border-line bg-surface-muted p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold">Community</h2>
          <span className="chip-static text-[11px]">User-contributed</span>
        </div>
        <CafeContribute slug={cafe.slug} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Drinks</h2>
        {cafe.drinks.length === 0 ? (
          <div className="card flex items-center gap-3 p-4 text-sm text-ink-muted">
            <Coffee size={20} className="shrink-0 text-ink-faint" />
            Menu information isn&apos;t available for this cafe yet.
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {cafe.drinks.map((d) => (
              <li key={d.id} className="card flex items-center justify-between p-3.5">
                <div>
                  <p className="font-medium text-ink">{d.name}</p>
                  <p className="text-xs capitalize text-ink-muted">
                    {d.category.toLowerCase().replace(/_/g, " ")}
                    {d.icedAvailable && d.hotAvailable
                      ? " · hot & iced"
                      : d.icedAvailable
                        ? " · iced"
                        : " · hot"}
                  </p>
                </div>
                <span className="text-sm text-ink-soft">{formatMoney(d.price, d.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="border-t border-line pt-4 text-xs text-ink-muted">
        Data source: {cafe.sourceName ?? cafe.source}.
        {cafe.photoAttribution && ` Photo: ${cafe.photoAttribution}.`} Map data ©
        OpenStreetMap contributors.
      </p>
    </article>
  );
}

function Detail({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="eyebrow mb-1.5 inline-flex items-center gap-1.5">
        <span className="text-ink-faint">{icon}</span>
        {title}
      </h2>
      <div className="text-ink-soft">{children}</div>
    </div>
  );
}
