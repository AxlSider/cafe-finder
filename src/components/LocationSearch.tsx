"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/geo";
import { MapPin, Search } from "@/components/icons";

interface GeoResult {
  label: string;
  locality: string;
  location: LatLng;
}

/**
 * Manual location search (fallback + always-available way to change area).
 * Debounced; coverage-restricted by the API. See docs/LOCATION.md.
 */
export function LocationSearch({
  onSelect,
  compact,
}: {
  onSelect: (loc: { location: LatLng; locality: string }) => void;
  compact?: boolean;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className={`relative ${compact ? "w-full sm:w-60" : "w-full"}`}>
      <label htmlFor="loc-search" className="sr-only">
        Where are you looking for coffee?
      </label>
      {compact ? (
        <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
      ) : (
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      )}
      <input
        id="loc-search"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={compact ? "Change location" : "Where are you looking for coffee?"}
        className={`field ${compact ? "h-11 min-h-0 pl-10 text-base sm:text-sm" : "pl-11"}`}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="loc-results"
      />
      {open && (results.length > 0 || loading) && (
        <ul
          id="loc-results"
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full min-w-[16rem] animate-scale-in overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-float"
        >
          {loading && (
            <li className="px-3 py-2.5 text-sm text-ink-muted">Searching…</li>
          )}
          {results.map((r, i) => (
            <li key={`${r.label}-${i}`} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onSelect({ location: r.location, locality: r.locality });
                  setQ("");
                  setResults([]);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-surface-sunken"
              >
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{r.locality}</span>
                  <span className="block truncate text-xs text-ink-muted">{r.label}</span>
                </span>
              </button>
            </li>
          ))}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-ink-muted">
              No matches in Luzon or Switzerland.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
