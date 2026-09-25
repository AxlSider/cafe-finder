"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";
import type { DrinkTypeLike } from "@/lib/drinks/recommend";
import { Coffee, Check, Sparkle } from "@/components/icons";

const GROUPS: { title: string; items: { key: string; label: string }[] }[] = [
  {
    title: "Taste",
    items: [
      { key: "sweet", label: "Sweet" },
      { key: "bitter", label: "Bitter" },
      { key: "strong", label: "Strong" },
      { key: "light", label: "Light" },
    ],
  },
  {
    title: "Style",
    items: [
      { key: "milkBased", label: "Milk-based" },
      { key: "black", label: "Black coffee" },
      { key: "matcha", label: "Matcha" },
      { key: "tea", label: "Tea" },
      { key: "chocolate", label: "Chocolate" },
    ],
  },
  {
    title: "Temperature",
    items: [
      { key: "hot", label: "Hot" },
      { key: "iced", label: "Iced" },
    ],
  },
];

interface Rec {
  drink: DrinkTypeLike;
  reasons: string[];
}

export function OrderExperience() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.preference) {
          const p: Record<string, boolean> = {};
          for (const g of GROUPS) for (const it of g.items) p[it.key] = !!data.preference[it.key];
          setPrefs(p);
        }
      } catch {
        /* guest — no prefill */
      }
    })();
  }, []);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  async function recommend() {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prefs, limit: 6 }),
      });
      const data = await res.json();
      setRecs(data.recommendations ?? []);
      track("recommend_drink", { prefs: Object.keys(prefs).filter((k) => prefs[k]) });
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  }

  const [match, ...others] = recs ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Signature</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          What should I order?
        </h1>
        <p className="mt-1.5 text-ink-muted">
          Tell us what you like and we&apos;ll match you to a drink — with the
          reasons why. A general coffee guide, not a specific cafe&apos;s menu.
        </p>
      </header>

      <div className="card space-y-5 p-6">
        {GROUPS.map((g) => (
          <fieldset key={g.title}>
            <legend className="eyebrow mb-2.5">{g.title}</legend>
            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => toggle(it.key)}
                  aria-pressed={!!prefs[it.key]}
                  className={`chip ${prefs[it.key] ? "chip-active" : ""}`}
                >
                  {prefs[it.key] && <Check size={13} />}
                  {it.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <button onClick={recommend} className="btn-primary w-full sm:w-auto" disabled={loading}>
          <Sparkle size={17} />
          {loading ? "Finding your match…" : "Reveal my drink"}
        </button>
      </div>

      {recs !== null && (
        <section className="space-y-4" aria-live="polite">
          {recs.length === 0 ? (
            <div className="card p-8 text-center text-ink-muted">
              <Coffee size={28} className="mx-auto text-ink-faint" />
              <p className="mt-2">Pick a few preferences above to get a match.</p>
            </div>
          ) : (
            <>
              {/* Your match */}
              <div className="animate-scale-in overflow-hidden rounded-card border border-brand-400/40 bg-gradient-to-br from-brand-500/12 via-surface to-accent-500/8 p-6">
                <p className="eyebrow text-brand-600">Your match</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {match!.drink.name}
                </h2>
                <p className="mt-1 text-ink-soft">{match!.drink.description}</p>
                {match!.reasons.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {match!.reasons.map((r) => (
                      <li key={r} className="reason">
                        <Check size={12} /> {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {others.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Also worth a try</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {others.map(({ drink, reasons }) => (
                      <li key={drink.id} className="card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-ink">{drink.name}</h3>
                          <span className="chip-static shrink-0 capitalize">
                            {drink.category.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink-muted">{drink.description}</p>
                        {reasons.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {reasons.slice(0, 3).map((r) => (
                              <li key={r} className="reason">
                                <Check size={11} /> {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
