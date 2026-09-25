import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CupScoutMark } from "@/components/Brand";
import {
  ArrowRight,
  MapPin,
  Compass,
  Coffee,
  Sparkle,
  Star,
  Navigation,
  Shield,
  Check,
  Bookmark,
  Clock,
  Wifi,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "CupScout — Find your next coffee",
  description:
    "A location-first coffee discovery app for Luzon (Philippines) and Switzerland. Find cafes near you, decide where to go, and know what to order.",
};

// Re-fetch the live catalog size at most hourly. Numbers are real; if the DB is
// unreachable at build/request time we fall back to a conservative floor so the
// page always renders (and never fabricates a bigger number than we have).
export const revalidate = 3600;

async function getStats(): Promise<{ cafes: number; localities: number }> {
  try {
    const [cafes, localities] = await Promise.all([
      prisma.cafe.count(),
      prisma.cafe.findMany({ distinct: ["locality"], select: { locality: true } }),
    ]);
    return { cafes, localities: localities.length };
  } catch {
    return { cafes: 1500, localities: 13 };
  }
}

export default async function LandingPage() {
  const stats = await getStats();
  const cafeCount = stats.cafes.toLocaleString("en-US");
  return (
    <div className="space-y-24 pb-8">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-2 lg:pt-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft">
            <CupScoutMark size={16} /> Location-first coffee discovery
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Find your next
            <span className="text-brand-600"> coffee</span>.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-muted">
            CupScout answers the two questions a map never does —{" "}
            <span className="font-medium text-ink-soft">where should I go</span>{" "}
            and{" "}
            <span className="font-medium text-ink-soft">what should I order</span>
            — with location-aware recommendations you can actually trust.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app" className="btn-primary px-5">
              <MapPin size={18} /> Find cafes near me
            </Link>
            <Link href="/order" className="btn-secondary px-5">
              What should I order? <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
            <Check size={15} className="text-accent-600" /> Covers Luzon
            (Philippines) &amp; Switzerland · free · no sign-up to browse
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            <Stat value={`${cafeCount}+`} label="Real cafes" />
            <Stat value={`${stats.localities}`} label="Cities & towns" />
            <Stat value="2" label="Regions covered" />
          </dl>
        </div>

        <Link
          href="/app"
          aria-label="Open CupScout and find cafes near you"
          className="group block animate-scale-in rounded-[2.2rem] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
        >
          <ProductMock cafeCount={cafeCount} />
        </Link>
      </section>

      {/* The two questions */}
      <section>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The core idea</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">
            Two decisions, made effortless
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/where"
            className="group flex items-start gap-4 rounded-card border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/12 text-brand-600">
              <MapPin size={24} />
            </span>
            <span>
              <span className="flex items-center gap-1.5 font-display text-lg font-bold text-ink">
                Where should I go?
                <ArrowRight size={16} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-sm text-ink-muted">
                Pick a purpose — study, work, a date — and get nearby cafes
                ranked, each with the reasons it fits.
              </span>
            </span>
          </Link>
          <Link
            href="/order"
            className="group flex items-start gap-4 rounded-card border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-500/12 text-accent-600">
              <Coffee size={24} />
            </span>
            <span>
              <span className="flex items-center gap-1.5 font-display text-lg font-bold text-ink">
                What should I order?
                <ArrowRight size={16} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-sm text-ink-muted">
                Tell us your taste and get matched to a drink — sweet, strong,
                milk-based, iced — with why it fits.
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why CupScout</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">
            Discovery that respects you
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature Icon={Compass} title="Genuinely nearby">
            Nearby means nearby — a real radius from your location, expandable
            when you want to look further. No cafe 150 km away pretending to be
            close.
          </Feature>
          <Feature Icon={Sparkle} title="Reasons, not guesses">
            Every recommendation shows why it fits — distance, rating, hours,
            purpose — so you can trust the pick.
          </Feature>
          <Feature Icon={Shield} title="Honest information">
            Ratings, hours and menus appear only when they&apos;re real. Missing
            info says so, instead of faking it.
          </Feature>
          <Feature Icon={Navigation} title="Maps that help you decide">
            Explore on the map, tap a cafe, and get directions in a tap. The map
            works with the list, not against it.
          </Feature>
          <Feature Icon={Bookmark} title="Save your places">
            Keep a personal collection of cafes and set a coffee profile for
            picks tuned to your taste.
          </Feature>
          <Feature Icon={Star} title="Installable & fast">
            Add CupScout to your home screen — a fast, offline-aware app with
            light and dark themes.
          </Feature>
        </div>
      </section>

      {/* Quick-start by city */}
      <section className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="eyebrow">Start exploring</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
          Jump into a city
        </h2>
        <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
          {[
            ["Baguio", "baguio"],
            ["Makati", "makati"],
            ["Manila", "manila"],
            ["Zürich", "zurich"],
          ].map(([label, slug]) => (
            <Link key={slug} href={`/app?place=${slug}`} className="chip">
              <MapPin size={14} /> {label}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-brand-500/15 via-surface to-accent-500/10 p-10 text-center">
        <CupScoutMark size={44} className="mx-auto" />
        <h2 className="mt-4 font-display text-3xl font-extrabold text-ink">
          Ready for a great cup?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          Find coffee near you in seconds — no sign-up required.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app" className="btn-primary px-5">
            <MapPin size={18} /> Find cafes near me
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-2 py-3 text-center">
      <dt className="font-display text-xl font-extrabold tracking-tight text-ink tabular-nums sm:text-2xl">
        {value}
      </dt>
      <dd className="mt-0.5 text-[11px] font-medium leading-tight text-ink-muted sm:text-xs">
        {label}
      </dd>
    </div>
  );
}

function Feature({
  Icon,
  title,
  children,
}: {
  Icon: (p: { size?: number; className?: string }) => React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-sunken text-brand-600">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted">{children}</p>
    </div>
  );
}

/**
 * On-brand product mock — a phone frame showing a realistic app screen: a search
 * bar, a stylized mini map (streets + a park block + clustered pins + a live
 * "you are here" dot), the featured cafe card, and the next result peeking below.
 * Pure SVG/CSS — no fabricated business data (the sample card is clearly a mock).
 */
function ProductMock({ cafeCount }: { cafeCount: string }) {
  return (
    <div className="relative mx-auto max-w-[19rem]">
      {/* soft brand glow behind the device */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-500/20 via-transparent to-accent-500/20 blur-2xl"
      />
      <div className="rounded-[2.2rem] border border-line bg-surface p-2.5 shadow-float">
        <div className="overflow-hidden rounded-[1.7rem] border border-line bg-surface">
          {/* status + search bar */}
          <div className="flex items-center gap-2 bg-surface px-4 pb-2 pt-3">
            <span className="flex-1 truncate rounded-full border border-line bg-surface-sunken px-3 py-1.5 text-xs text-ink-muted">
              <MapPin size={11} className="mr-1 inline text-brand-600" />
              Near you · Makati
            </span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/12 text-brand-600">
              <Sparkle size={13} />
            </span>
          </div>

          {/* mini map */}
          <div className="relative h-44 bg-gradient-to-br from-accent-500/10 via-surface-sunken to-brand-500/10">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 176" preserveAspectRatio="xMidYMid slice" aria-hidden>
              {/* park block */}
              <rect x="196" y="14" width="120" height="70" rx="10" fill="rgb(var(--accent-500) / 0.14)" />
              {/* streets */}
              <g stroke="rgb(var(--ink) / 0.10)" strokeWidth="8" strokeLinecap="round" fill="none">
                <path d="M-10 60 H330" />
                <path d="M-10 128 H330" />
                <path d="M70 -10 V186" />
                <path d="M210 -10 V186" />
                <path d="M-10 150 L120 96 L330 118" />
              </g>
              <g stroke="rgb(var(--ink) / 0.055)" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M-10 30 H330" />
                <path d="M-10 96 H330" />
                <path d="M140 -10 V186" />
                <path d="M270 -10 V186" />
              </g>
            </svg>

            {/* clustered pins */}
            <Cluster className="left-[20%] top-[30%]" count={8} />
            <MockPin className="left-[62%] top-[24%]" active />
            <Cluster className="left-[78%] top-[64%]" count={3} />
            <MockPin className="left-[34%] top-[70%]" />

            {/* live location */}
            <span className="absolute left-[46%] top-[52%]">
              <span className="absolute -inset-2 animate-ping rounded-full bg-accent-500/30" />
              <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-accent-500 shadow" />
            </span>

            <span className="absolute bottom-2 left-3 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-ink-soft shadow-sm backdrop-blur">
              {cafeCount}+ cafes mapped
            </span>
          </div>

          {/* featured cafe card */}
          <div className="space-y-2.5 bg-surface p-3.5">
            <div className="flex gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/25 to-accent-500/20 text-brand-700">
                <Coffee size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-display text-sm font-bold text-ink">
                    Corner Roasters
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-500/12 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
                    <Star size={11} filled /> 4.7
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Navigation size={11} className="text-accent-600" /> 0.4 km
                  <span className="text-ink-faint">·</span>
                  <Clock size={11} className="text-accent-600" />
                  <span className="font-medium text-accent-600">Open now</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="reason text-[10px]"><Coffee size={10} /> Specialty</span>
                  <span className="reason text-[10px]"><Wifi size={10} /> Wi-Fi</span>
                  <span className="reason text-[10px]"><Check size={10} /> Great to study</span>
                </div>
              </div>
            </div>
            <div className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-brand-700">
              <Navigation size={13} /> Get directions
            </div>
          </div>

          {/* next result peeking below to imply a full list */}
          <div className="flex items-center gap-3 border-t border-line bg-surface-sunken/60 px-3.5 py-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent-500/20 to-brand-500/15 text-accent-700">
              <Coffee size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-ink">Kalsada Coffee</div>
              <div className="text-[11px] text-ink-muted">0.9 km · Quiet · Outdoor seating</div>
            </div>
            <Star size={12} filled className="shrink-0 text-brand-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPin({ className, active }: { className?: string; active?: boolean }) {
  return (
    <span className={`absolute -translate-x-1/2 -translate-y-full drop-shadow ${className}`}>
      <MapPin size={active ? 30 : 22} className={active ? "text-brand-600" : "text-brand-500/80"} />
    </span>
  );
}

function Cluster({ className, count }: { className?: string; count: number }) {
  return (
    <span
      className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-brand-600 text-[11px] font-bold text-white shadow ${className}`}
      style={{ width: 26, height: 26 }}
    >
      {count}
    </span>
  );
}
