"use client";

import { useState } from "react";
import { X } from "@/components/icons";

/** Admin moderation of community photos for a cafe. */
export function PhotoModeration({
  photos: initial,
}: {
  photos: { id: string; url: string }[];
}) {
  const [photos, setPhotos] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  if (photos.length === 0) {
    return <p className="text-sm text-ink-muted">No community photos.</p>;
  }

  async function remove(id: string) {
    if (!confirm("Delete this community photo?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (res.ok) setPhotos((p) => p.filter((x) => x.id !== id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {photos.map((p) => (
        <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="Community photo" className="h-full w-full object-cover" />
          <button
            onClick={() => remove(p.id)}
            disabled={busy === p.id}
            aria-label="Delete photo"
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-danger text-white opacity-90 hover:opacity-100"
          >
            <X size={13} />
          </button>
        </li>
      ))}
    </ul>
  );
}
