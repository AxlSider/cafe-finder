import Link from "next/link";
import type { CafeSummary } from "@/lib/places/types";
import { formatDistance } from "@/lib/geo";
import { priceLevelLabel } from "@/lib/format";
import { CafePhoto } from "@/components/CafePhoto";
import { Star, MapPin, Check } from "@/components/icons";

/**
 * Cafe card with three compositions:
 *  - "featured": large hero image, headline overlay (discovery rails / heroes)
 *  - "standard": image + details side-by-side (default lists)
 *  - "compact": small thumb + minimal meta (dense/map contexts)
 * Missing rating/price degrade to honest affordances, never blanks.
 */
type Variant = "featured" | "standard" | "compact";

function OpenBadge({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        open ? "text-accent-600" : "text-ink-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          open ? "bg-accent-500" : "bg-ink-faint"
        }`}
      />
      {open ? "Open now" : "Closed"}
    </span>
  );
}

function Rating({ cafe }: { cafe: CafeSummary }) {
  if (cafe.rating == null) {
    return <span className="text-xs text-ink-faint">Rating unavailable</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
      <Star size={14} filled className="text-brand-500" />
      {cafe.rating.toFixed(1)}
      {cafe.reviewCount != null && (
        <span className="text-ink-faint">({cafe.reviewCount})</span>
      )}
      {cafe.ratingSource && (
        <span className="text-xs font-normal text-ink-faint">· {cafe.ratingSource}</span>
      )}
    </span>
  );
}

function Meta({ cafe }: { cafe: CafeSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
      {cafe.distanceKm != null && <span>{formatDistance(cafe.distanceKm)}</span>}
      {cafe.priceLevel && (
        <span className="font-medium text-ink-soft">
          {priceLevelLabel(cafe.priceLevel)}
        </span>
      )}
      {cafe.openNow !== undefined && <OpenBadge open={cafe.openNow} />}
    </div>
  );
}

function Reasons({ reasons }: { reasons?: string[] }) {
  if (!reasons?.length) return null;
  return (
    <ul className="mt-2.5 flex flex-wrap gap-1.5">
      {reasons.slice(0, 3).map((r) => (
        <li key={r} className="reason">
          <Check size={12} />
          {r}
        </li>
      ))}
    </ul>
  );
}

export function CafeCard({
  cafe,
  reasons,
  variant = "standard",
  onHover,
  active,
  eager,
}: {
  cafe: CafeSummary;
  reasons?: string[];
  variant?: Variant;
  onHover?: (id: string | null) => void;
  active?: boolean;
  eager?: boolean;
}) {
  const hover = onHover
    ? {
        onMouseEnter: () => onHover(cafe.id),
        onMouseLeave: () => onHover(null),
      }
    : {};

  if (variant === "featured") {
    return (
      <Link
        href={`/cafes/${cafe.slug}`}
        {...hover}
        className="group relative block aspect-[3/2] overflow-hidden rounded-card shadow-card transition-transform duration-300 ease-spring hover:-translate-y-1 hover:shadow-pop sm:aspect-[16/9]"
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
          <CafePhoto name={cafe.name} photoUrl={cafe.photoUrl} photoAlt={cafe.photoAlt} rounded="" eager={eager} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {cafe.openNow && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-accent-700">
            Open now
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display text-lg font-bold">{cafe.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-white/85">
            <MapPin size={14} /> {cafe.locality}
            {cafe.distanceKm != null && (
              <span className="text-white/70">· {formatDistance(cafe.distanceKm)}</span>
            )}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/cafes/${cafe.slug}`}
        {...hover}
        className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${
          active ? "border-brand-400 bg-brand-50" : "border-transparent hover:bg-surface-sunken"
        }`}
      >
        <div className="h-14 w-14 shrink-0">
          <CafePhoto name={cafe.name} photoUrl={cafe.photoUrl} photoAlt={cafe.photoAlt} rounded="rounded-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">{cafe.name}</h3>
          <Meta cafe={cafe} />
        </div>
      </Link>
    );
  }

  // standard
  return (
    <Link
      href={`/cafes/${cafe.slug}`}
      {...hover}
      className={`group flex gap-3.5 rounded-card border bg-surface p-3 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-pop ${
        active ? "border-brand-400 ring-1 ring-brand-400" : "border-line"
      }`}
    >
      <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
        <CafePhoto name={cafe.name} photoUrl={cafe.photoUrl} photoAlt={cafe.photoAlt} rounded="rounded-xl" eager={eager} />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-base font-bold text-ink">
            {cafe.name}
          </h3>
          <span className="mt-0.5 shrink-0">
            <Rating cafe={cafe} />
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-muted">
          <MapPin size={13} /> {cafe.locality}
        </p>
        <div className="mt-1.5">
          <Meta cafe={cafe} />
        </div>
        {cafe.tags.length > 0 && !reasons?.length && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {cafe.tags.slice(0, 3).map((t) => (
              <li key={t} className="chip-static capitalize">
                {t.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        )}
        <Reasons reasons={reasons} />
      </div>
    </Link>
  );
}
