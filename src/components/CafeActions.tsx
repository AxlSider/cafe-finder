"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { track } from "@/lib/analytics/client";
import type { CafeDetail } from "@/lib/places/types";
import { Heart, Navigation, Globe, Phone, Flag } from "@/components/icons";

/**
 * Cafe action bar. Save is server-backed for logged-in users and falls back to
 * localStorage for guests. See docs/FEATURES.md.
 */
export function CafeActions({ cafe }: { cafe: CafeDetail }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user) {
        try {
          const res = await fetch("/api/favorites/cafes", { cache: "no-store" });
          const data = await res.json();
          if (!cancelled) {
            setSaved(
              Array.isArray(data.cafes) &&
                data.cafes.some((c: { id: string }) => c.id === cafe.id),
            );
          }
        } catch {
          /* ignore */
        }
      } else {
        try {
          const raw = window.localStorage.getItem("cf:saved-cafes");
          const ids: string[] = raw ? JSON.parse(raw) : [];
          if (!cancelled) setSaved(ids.includes(cafe.id));
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, cafe.id]);

  async function toggleSave() {
    setBusy(true);
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      if (user) {
        if (nextSaved) {
          await fetch("/api/favorites/cafes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cafeId: cafe.id }),
          });
        } else {
          await fetch(`/api/favorites/cafes?cafeId=${cafe.id}`, { method: "DELETE" });
        }
      } else {
        const raw = window.localStorage.getItem("cf:saved-cafes");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        const updated = nextSaved
          ? [...new Set([...ids, cafe.id])]
          : ids.filter((i) => i !== cafe.id);
        window.localStorage.setItem("cf:saved-cafes", JSON.stringify(updated));
      }
      if (nextSaved) track("save_cafe", { cafeId: cafe.id }, cafe.region);
    } catch {
      setSaved(!nextSaved);
    } finally {
      setBusy(false);
    }
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${cafe.location.lat},${cafe.location.lng}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={toggleSave}
        className={saved ? "btn-primary" : "btn-secondary"}
        aria-pressed={saved}
        disabled={busy}
      >
        <Heart size={17} filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
      <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-secondary"
        onClick={() => track("directions", { cafeId: cafe.id }, cafe.region)}>
        <Navigation size={17} />
        Directions
      </a>
      {cafe.website && (
        <a href={cafe.website} target="_blank" rel="noreferrer" className="btn-secondary">
          <Globe size={17} />
          Website
        </a>
      )}
      {cafe.phone && (
        <a href={`tel:${cafe.phone}`} className="btn-secondary">
          <Phone size={17} />
          Call
        </a>
      )}
      <a href={`/cafes/${cafe.slug}/report`} className="btn-ghost">
        <Flag size={16} />
        Report
      </a>
    </div>
  );
}
