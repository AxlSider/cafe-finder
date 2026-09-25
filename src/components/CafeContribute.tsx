"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, Check, Plus, iconByKey, Coffee } from "@/components/icons";

interface CommunityState {
  isAuthed: boolean;
  communityRating: number | null;
  communityRatingCount: number;
  myRating: number | null;
  photos: { id: string; url: string }[];
  amenityCounts: Record<string, number>;
  myAmenityKeys: string[];
}

const AMENITIES: { key: string; label: string }[] = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "outlets", label: "Power outlets" },
  { key: "parking", label: "Parking" },
  { key: "outdoor", label: "Outdoor seating" },
  { key: "quiet", label: "Quiet space" },
];

export function CafeContribute({ slug }: { slug: string }) {
  const [state, setState] = useState<CommunityState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch(`/api/cafes/${slug}/community`, { cache: "no-store" });
      setState(await res.json());
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function rate(value: number) {
    const res = await fetch(`/api/cafes/${slug}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const d = await res.json();
      setState((s) =>
        s ? { ...s, myRating: d.myRating, communityRating: d.communityRating, communityRatingCount: d.communityRatingCount } : s,
      );
    }
  }

  async function toggleAmenity(key: string) {
    if (!state) return;
    const add = !state.myAmenityKeys.includes(key);
    const res = await fetch(`/api/cafes/${slug}/amenities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amenityKey: key, add }),
    });
    if (res.ok) {
      const d = await res.json();
      setState((s) => {
        if (!s) return s;
        const myKeys = add ? [...s.myAmenityKeys, key] : s.myAmenityKeys.filter((k) => k !== key);
        return { ...s, myAmenityKeys: myKeys, amenityCounts: { ...s.amenityCounts, [key]: d.count } };
      });
    }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/cafes/${slug}/photos`, { method: "POST", body: fd });
      if (res.ok) {
        const d = await res.json();
        setState((s) => (s ? { ...s, photos: [d.photo, ...s.photos] } : s));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  if (!state) return <div className="h-40 rounded-card skeleton" />;

  const shownStar = hoverStar || state.myRating || 0;

  return (
    <div className="space-y-6">
      {/* Photos */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Photos</h3>
          {state.isAuthed && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-secondary h-9 px-3 text-sm"
            >
              <Plus size={15} /> {uploading ? "Uploading…" : "Add photo"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </div>
        {state.photos.length === 0 ? (
          <div className="card flex items-center gap-3 p-4 text-sm text-ink-muted">
            <Coffee size={20} className="shrink-0 text-ink-faint" />
            No community photos yet.{" "}
            {state.isAuthed ? "Be the first to add one." : "Log in to add one."}
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {state.photos.map((p) => (
              <li key={p.id} className="aspect-square overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Community cafe photo" loading="lazy" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Your rating */}
      <div>
        <h3 className="mb-2 font-display text-base font-bold">Rate this cafe</h3>
        {state.isAuthed ? (
          <div className="flex items-center gap-3">
            <div className="flex" onMouseLeave={() => setHoverStar(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverStar(n)}
                  onClick={() => rate(n)}
                  className="p-0.5 text-brand-500 transition-transform hover:scale-110"
                >
                  <Star size={26} filled={n <= shownStar} className={n <= shownStar ? "" : "text-ink-faint"} />
                </button>
              ))}
            </div>
            {state.myRating && <span className="text-sm text-ink-muted">Your rating: {state.myRating}/5</span>}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            <Link href={`/login?next=/cafes/${slug}`} className="font-medium text-brand-700 underline">
              Log in
            </Link>{" "}
            to rate this cafe.
          </p>
        )}
        {state.communityRatingCount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-ink-soft">
            <Star size={15} filled className="text-brand-500" />
            {state.communityRating?.toFixed(1)} · {state.communityRatingCount} community rating
            {state.communityRatingCount > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Confirm amenities */}
      <div>
        <h3 className="mb-2 font-display text-base font-bold">Amenities here?</h3>
        <p className="mb-2 text-sm text-ink-muted">
          {state.isAuthed
            ? "Tap what this cafe has — your confirmations help others."
            : "Community-confirmed amenities."}
        </p>
        <ul className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const Icon = iconByKey[a.key] ?? Coffee;
            const count = state.amenityCounts[a.key] ?? 0;
            const mine = state.myAmenityKeys.includes(a.key);
            return (
              <li key={a.key}>
                <button
                  disabled={!state.isAuthed}
                  onClick={() => toggleAmenity(a.key)}
                  aria-pressed={mine}
                  className={`chip ${mine ? "chip-active" : ""} ${!state.isAuthed ? "cursor-default" : ""}`}
                >
                  <Icon size={15} />
                  {a.label}
                  {count > 0 && (
                    <span className={`ml-1 inline-flex items-center gap-0.5 ${mine ? "" : "text-ink-faint"}`}>
                      <Check size={11} /> {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
