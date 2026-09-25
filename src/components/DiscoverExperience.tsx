"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CafeSummary } from "@/lib/places/types";
import type { LatLng } from "@/lib/geo";
import { regionForCoords, formatDistance } from "@/lib/geo";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { CafeCard } from "@/components/CafeCard";
import { CafePhoto } from "@/components/CafePhoto";
import { LocationSearch } from "@/components/LocationSearch";
import { track } from "@/lib/analytics/client";
import { CupScoutMark } from "@/components/Brand";
import {
  Search,
  MapPin,
  List,
  Map as MapIcon,
  iconByKey,
  Compass,
  Star,
  X,
  ArrowRight,
} from "@/components/icons";

const CafeMap = dynamic(() => import("@/components/CafeMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[320px] skeleton" />,
});

type Category = { key: string; label: string; apply: (p: URLSearchParams) => void };

const CATEGORIES: Category[] = [
  { key: "nearby", label: "Nearby", apply: (p) => p.set("sort", "distance") },
  { key: "open", label: "Open Now", apply: (p) => p.set("openNow", "true") },
  { key: "rated", label: "Highly Rated", apply: (p) => p.set("minRating", "4.3") },
  { key: "study", label: "Study", apply: (p) => p.set("tags", "study") },
  { key: "work", label: "Work", apply: (p) => p.set("tags", "work") },
  { key: "date", label: "Date", apply: (p) => p.set("tags", "date") },
  { key: "specialty", label: "Specialty", apply: (p) => p.set("tags", "specialty") },
  { key: "budget", label: "Budget", apply: (p) => p.set("tags", "budget") },
  { key: "late", label: "Open Late", apply: (p) => p.set("tags", "open_late") },
];

const RADII = [5, 10, 25, 50];
type View = "list" | "map";

export function DiscoverExperience({
  initialOrigin,
  initialLocality,
}: {
  initialOrigin?: LatLng | null;
  initialLocality?: string | null;
} = {}) {
  const geo = useGeolocation();
  const [originSource, setOriginSource] = useState<"gps" | "search">("gps");
  const [locality, setLocality] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<"unknown" | "covered" | "uncovered">("unknown");
  const [cafes, setCafes] = useState<CafeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false); // a text search is active
  const [category, setCategory] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const coords = geo.coords;

  // Deep-linked demo entry (e.g. /app?place=Baguio) preloads a location so a
  // cold visitor sees a populated experience without granting GPS.
  useEffect(() => {
    if (initialOrigin) {
      setOriginSource("search");
      setLocality(initialLocality ?? "this area");
      setCoverage("covered");
      geo.setManual(initialOrigin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geo.status === "denied") track("location_denied");
  }, [geo.status]);
  useEffect(() => {
    if (coverage === "uncovered") track("out_of_coverage");
  }, [coverage]);

  // Reverse-geocode GPS coords for a locality label + coverage check.
  useEffect(() => {
    if (!coords || originSource !== "gps") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/geocode?lat=${coords.lat}&lng=${coords.lng}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.covered === false) {
          setCoverage("uncovered");
          setLocality(null);
        } else if (data.result) {
          setCoverage("covered");
          setLocality(data.result.locality);
        }
      } catch {
        if (!cancelled) setLocality(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coords, originSource]);

  const fetchCafes = useCallback(
    async (origin: LatLng | null, searchText: string, cat: string | null, radius: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (origin) {
          params.set("lat", String(origin.lat));
          params.set("lng", String(origin.lng));
        }
        const isText = Boolean(searchText.trim());
        if (isText) params.set("q", searchText.trim());
        else if (origin) params.set("radiusKm", String(radius));
        CATEGORIES.find((c) => c.key === cat)?.apply(params);
        params.set("limit", "50");
        const res = await fetch(`/api/cafes/nearby?${params.toString()}`);
        const data = await res.json();
        if (data.covered === false) {
          setCoverage("uncovered");
          setCafes([]);
          return;
        }
        // Distinguish a real failure (server/DB error) from "no cafes here" so
        // the UI shows an error state instead of a misleading empty state.
        if (!res.ok || data.error) {
          setError("We couldn't load cafes right now. Please try again.");
          setCafes([]);
          return;
        }
        setCafes(data.cafes ?? []);
      } catch {
        setError("Something went wrong loading cafes. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Auto-fetch on location / category / radius changes (not on every keystroke).
  useEffect(() => {
    if (coverage === "uncovered" || !coords || searching) return;
    fetchCafes(coords, "", category, radiusKm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, category, radiusKm]);

  const useMyLocation = () => {
    setOriginSource("gps");
    setRadiusKm(5);
    setSearching(false);
    setQ("");
    geo.request();
  };

  const onManualLocation = useCallback(
    (loc: { location: LatLng; locality: string }) => {
      setOriginSource("search");
      setLocality(loc.locality);
      setCoverage("covered");
      setRadiusKm(5);
      setSearching(false);
      setQ("");
      geo.setManual(loc.location);
    },
    [geo],
  );

  const onSearchArea = useCallback(
    (center: LatLng) => {
      setOriginSource("search");
      setLocality("this area");
      setRadiusKm(5);
      setSearching(false);
      setQ("");
      geo.setManual(center);
    },
    [geo],
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    const text = q.trim();
    setSearching(Boolean(text));
    fetchCafes(coords, text, category, radiusKm);
    if (text) track("search", { q: text }, regionForCoords(coords));
  };

  const clearSearch = () => {
    setQ("");
    setSearching(false);
    if (coords) fetchCafes(coords, "", category, radiusKm);
  };

  const hasLocation = geo.status === "granted" && coords;

  const header = useMemo(() => {
    if (originSource === "search") {
      return { eyebrow: "Exploring", title: locality ?? "this area" };
    }
    return { eyebrow: "Good coffee, near you", title: locality ?? "Near you" };
  }, [originSource, locality]);

  if (!hasLocation) {
    return (
      <LocationIntro
        status={geo.status}
        error={geo.error}
        onRequest={useMyLocation}
        onManualLocation={onManualLocation}
      />
    );
  }

  if (coverage === "uncovered") {
    return (
      <section className="mx-auto max-w-lg animate-scale-in py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <Compass size={30} />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Outside our map</h2>
        <p className="mt-1 text-ink-muted">CupScout currently covers Luzon and Switzerland.</p>
        <div className="mx-auto mt-5 max-w-sm">
          <LocationSearch onSelect={onManualLocation} />
        </div>
      </section>
    );
  }

  const nextRadius = RADII.find((r) => r > radiusKm);
  const showEmpty = !loading && cafes.length === 0;
  const [featured, ...rest] = cafes;
  const showFeatured = !searching && !category && featured;

  const list = (
    <div aria-busy={loading}>
      {loading && cafes.length === 0 ? (
        <div className="space-y-3">
          <div className="aspect-[3/2] skeleton rounded-card sm:aspect-[16/9]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-card" />
          ))}
        </div>
      ) : showEmpty ? (
        <EmptyResults
          searching={searching}
          q={q}
          radiusKm={radiusKm}
          nextRadius={nextRadius}
          onExpand={() => nextRadius && setRadiusKm(nextRadius)}
        />
      ) : (
        <div className="space-y-3">
          {showFeatured && (
            <div className="mb-1">
              <p className="eyebrow mb-2">Featured near you</p>
              <CafeCard cafe={featured} variant="featured" onHover={setActiveId} eager />
            </div>
          )}
          {(showFeatured ? rest : cafes).map((cafe, i) => (
            <CafeCard key={cafe.id} cafe={cafe} active={cafe.id === activeId} onHover={setActiveId} eager={i < 2} />
          ))}
        </div>
      )}
    </div>
  );

  const map = (
    <CafeMap cafes={cafes} origin={coords} activeId={activeId} onSelect={setActiveId} onSearchArea={onSearchArea} />
  );

  const activeCafe = cafes.find((c) => c.id === activeId) ?? null;

  return (
    <div className="space-y-5">
      {/* Location + headline */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{header.eyebrow}</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
            <MapPin size={22} className="text-brand-500" />
            {header.title}
          </h1>
        </div>
        <LocationSearch onSelect={onManualLocation} compact />
      </div>

      {/* Search */}
      <form onSubmit={onSearchSubmit} role="search" className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <label htmlFor="cafe-search" className="sr-only">Search cafes, drinks, or places</label>
        <input
          id="cafe-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cafes, drinks, or places"
          className="field pl-11 pr-11"
        />
        {searching && (
          <button type="button" onClick={clearSearch} aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-surface-sunken">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Category rail */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5" role="group" aria-label="Discovery categories">
        {CATEGORIES.map((c) => {
          const Icon = iconByKey[c.key] ?? Compass;
          const on = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                const next = on ? null : c.key;
                setCategory(next);
                if (next) track("discover_category", { category: next });
              }}
              className={`chip flex-none ${on ? "chip-active" : ""}`}
              aria-pressed={on}
            >
              <Icon size={15} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Mobile segmented view control */}
      <div className="flex rounded-full border border-line bg-surface p-1 lg:hidden">
        {(["list", "map"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
              view === v ? "bg-brand-600 text-white" : "text-ink-muted"
            }`}
          >
            {v === "list" ? <List size={16} /> : <MapIcon size={16} />}
            {v === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>

      {error ? (
        <div className="card p-6 text-center">
          <p className="text-ink">{error}</p>
          <button onClick={() => fetchCafes(coords, searching ? q : "", category, radiusKm)} className="btn-secondary mt-3">
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: discovery leads, map is a supporting sticky panel */}
          <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="max-h-[calc(100dvh-11rem)] overflow-y-auto pr-1">{list}</div>
            <div className="sticky top-24 h-[calc(100dvh-9rem)] overflow-hidden rounded-card border border-line">
              {map}
            </div>
          </div>
          {/* Mobile */}
          <div className="lg:hidden">
            {view === "list" ? (
              list
            ) : (
              <div className="relative h-[70dvh] overflow-hidden rounded-card border border-line">
                {map}
                {activeCafe && (
                  <BottomSheet cafe={activeCafe} onClose={() => setActiveId(null)} />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BottomSheet({ cafe, onClose }: { cafe: CafeSummary; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-[600] animate-sheet-up rounded-t-card border-t border-line bg-surface p-3 shadow-float">
      <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line" />
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0">
          <CafePhoto name={cafe.name} photoUrl={cafe.photoUrl} photoAlt={cafe.photoAlt} rounded="rounded-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-bold text-ink">{cafe.name}</h3>
            <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-surface-sunken">
              <X size={16} />
            </button>
          </div>
          <p className="truncate text-sm text-ink-muted">{cafe.locality}</p>
          <div className="mt-0.5 flex items-center gap-3 text-sm">
            {cafe.rating != null ? (
              <span className="inline-flex items-center gap-1 font-medium text-ink">
                <Star size={13} filled className="text-brand-500" /> {cafe.rating.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs text-ink-faint">Rating unavailable</span>
            )}
            {cafe.distanceKm != null && <span className="text-ink-soft">{formatDistance(cafe.distanceKm)}</span>}
          </div>
        </div>
      </div>
      <Link href={`/cafes/${cafe.slug}`} className="btn-primary mt-3 w-full">
        View details <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function EmptyResults({
  searching,
  q,
  radiusKm,
  nextRadius,
  onExpand,
}: {
  searching: boolean;
  q: string;
  radiusKm: number;
  nextRadius?: number;
  onExpand: () => void;
}) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
        <Search size={26} />
      </div>
      {searching ? (
        <>
          <p className="mt-3 font-medium text-ink">No results for “{q}”</p>
          <p className="mt-1 text-sm text-ink-muted">Try a different name, drink, or place.</p>
        </>
      ) : (
        <>
          <p className="mt-3 font-medium text-ink">No cafes within {radiusKm} km</p>
          {nextRadius ? (
            <>
              <p className="mt-1 text-sm text-ink-muted">Nothing close by. Widen the search?</p>
              <button onClick={onExpand} className="btn-secondary mt-4">
                Expand to {nextRadius} km
              </button>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-muted">
              No cafes found in this area yet. Try another location.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function LocationIntro({
  status,
  error,
  onRequest,
  onManualLocation,
}: {
  status: string;
  error: string | null;
  onRequest: () => void;
  onManualLocation: (loc: { location: LatLng; locality: string }) => void;
}) {
  const denied = status === "denied" || status === "unavailable" || status === "error";
  return (
    <section className="mx-auto max-w-md py-6">
      <div className="animate-fade-up overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="relative flex flex-col items-center bg-gradient-to-br from-brand-500/15 via-surface to-accent-500/10 px-6 pb-6 pt-10 text-center">
          <CupScoutMark size={52} />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">Find your next coffee</h1>
          <p className="mx-auto mt-2 max-w-sm text-ink-muted">
            CupScout uses your location to surface great cafes nearby across Luzon and Switzerland.
            It&apos;s only used to find coffee — nothing else.
          </p>
        </div>
        <div className="space-y-4 p-6">
          {!denied ? (
            <button onClick={onRequest} className="btn-primary w-full" disabled={status === "prompting"}>
              <MapPin size={18} />
              {status === "prompting" ? "Locating…" : "Use my location"}
            </button>
          ) : (
            <p className="rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning">
              {error ?? "Location access was denied."} Search a place instead.
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-line" /> OR SEARCH A PLACE <span className="h-px flex-1 bg-line" />
          </div>
          <LocationSearch onSelect={onManualLocation} />
        </div>
      </div>
    </section>
  );
}
