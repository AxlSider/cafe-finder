"use client";

import { useState } from "react";
import type { CafeSummary } from "@/lib/places/types";
import type { LatLng } from "@/lib/geo";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { LocationSearch } from "@/components/LocationSearch";
import { CafeCard } from "@/components/CafeCard";
import { track } from "@/lib/analytics/client";
import { MapPin, Compass, iconByKey } from "@/components/icons";

const INTENTS: { key: string; label: string }[] = [
  { key: "study", label: "Study" },
  { key: "work", label: "Work" },
  { key: "date", label: "Date" },
  { key: "quiet", label: "Quiet" },
  { key: "hangout", label: "Hangout" },
  { key: "groups", label: "Groups" },
  { key: "specialty", label: "Specialty Coffee" },
  { key: "budget", label: "Budget" },
  { key: "open_late", label: "Open Late" },
];

interface Rec {
  cafe: CafeSummary;
  reasons: string[];
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">
      {n}
    </span>
  );
}

export function WhereExperience() {
  const geo = useGeolocation();
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [locality, setLocality] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  const effectiveOrigin = origin ?? geo.coords;

  function toggleIntent(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  async function recommend() {
    if (!effectiveOrigin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("lat", String(effectiveOrigin.lat));
      params.set("lng", String(effectiveOrigin.lng));
      if (selected.length) params.set("tags", selected.join(","));
      if (openNow) params.set("openNow", "true");
      params.set("limit", "20");
      const res = await fetch(`/api/recommend/cafes?${params.toString()}`);
      const data = await res.json();
      setRecs(data.recommendations ?? []);
      track("recommend_cafe", { intents: selected });
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">Signature</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          Where should I go?
        </h1>
        <p className="mt-1.5 text-ink-muted">
          Pick your purpose and we&apos;ll rank nearby cafes — and show exactly
          why each one fits.
        </p>
      </header>

      {/* Step 1 — location */}
      <div className="card space-y-3 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <StepBadge n={1} /> Where are you?
        </p>
        {effectiveOrigin ? (
          <p className="flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin size={16} className="text-brand-500" />
            {locality ?? "Your location"}
            <button
              className="ml-2 font-medium text-brand-600 underline"
              onClick={() => {
                setOrigin(null);
                setLocality(null);
              }}
            >
              change
            </button>
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button onClick={geo.request} className="btn-secondary" disabled={geo.status === "prompting"}>
              <MapPin size={16} />
              {geo.status === "prompting" ? "Locating…" : "Use my location"}
            </button>
            <span className="text-sm text-ink-muted">or</span>
            <div className="sm:w-72">
              <LocationSearch onSelect={(loc) => {
                setOrigin(loc.location);
                setLocality(loc.locality);
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — intent */}
      <div className="card space-y-4 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <StepBadge n={2} /> What&apos;s the plan?
        </p>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => {
            const Icon = iconByKey[i.key] ?? Compass;
            const on = selected.includes(i.key);
            return (
              <button
                key={i.key}
                onClick={() => toggleIntent(i.key)}
                aria-pressed={on}
                className={`chip ${on ? "chip-active" : ""}`}
              >
                <Icon size={15} />
                {i.label}
              </button>
            );
          })}
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)}
            className="h-4 w-4 accent-[rgb(var(--brand-600))]" />
          Open now only
        </label>
        <button onClick={recommend} className="btn-primary w-full sm:w-auto" disabled={!effectiveOrigin || loading}>
          <Compass size={17} />
          {loading ? "Finding…" : "Find my cafe"}
        </button>
        {!effectiveOrigin && <p className="text-xs text-ink-muted">Set your location first.</p>}
      </div>

      {recs !== null && (
        <section className="space-y-3" aria-live="polite">
          {recs.length === 0 ? (
            <div className="card p-8 text-center text-ink-muted">
              <Compass size={28} className="mx-auto text-ink-faint" />
              <p className="mt-2">No matches. Try fewer filters or another location.</p>
            </div>
          ) : (
            <>
              <p className="eyebrow">Recommended for you</p>
              {recs.map(({ cafe, reasons }) => (
                <CafeCard key={cafe.id} cafe={cafe} reasons={reasons} />
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
