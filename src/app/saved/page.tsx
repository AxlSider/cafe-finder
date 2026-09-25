"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CafeSummary } from "@/lib/places/types";
import { CafeCard } from "@/components/CafeCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { Bookmark, ArrowRight } from "@/components/icons";

/**
 * Saved cafes. Server-backed for signed-in users; localStorage for guests.
 */
export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const [cafes, setCafes] = useState<CafeSummary[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (user) {
        try {
          const res = await fetch("/api/favorites/cafes", { cache: "no-store" });
          const data = await res.json();
          setCafes(data.cafes ?? []);
        } catch {
          setCafes([]);
        }
        return;
      }
      let ids: string[] = [];
      try {
        const raw = window.localStorage.getItem("cf:saved-cafes");
        ids = raw ? JSON.parse(raw) : [];
      } catch {
        ids = [];
      }
      if (ids.length === 0) {
        setCafes([]);
        return;
      }
      try {
        const res = await fetch("/api/cafes/nearby?limit=100");
        const data = await res.json();
        const all: CafeSummary[] = data.cafes ?? [];
        setCafes(all.filter((c) => ids.includes(c.id)));
      } catch {
        setCafes([]);
      }
    })();
  }, [user, authLoading]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Your collection</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">Saved</h1>
        </div>
        {!authLoading && !user && (
          <Link href="/login?next=/saved" className="btn-secondary">
            Log in to sync
          </Link>
        )}
      </div>

      {cafes === null ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 rounded-card skeleton" />
          ))}
        </div>
      ) : cafes.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Bookmark size={28} />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-ink">
            Nothing saved yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-muted">
            Tap <span className="font-medium text-ink-soft">Save</span> on any cafe
            to keep it here for later.
          </p>
          <Link href="/app" className="btn-primary mt-5">
            Discover cafes <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cafes.map((c) => (
            <CafeCard key={c.id} cafe={c} />
          ))}
        </div>
      )}
    </div>
  );
}
