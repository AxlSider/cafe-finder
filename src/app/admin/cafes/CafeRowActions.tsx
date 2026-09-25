"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CafeRowActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Delete this cafe? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}/enrich`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.matched) router.refresh();
      else alert(data.error ?? data.message ?? "Nothing to sync.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <a href={`/admin/cafes/${id}/edit`} className="btn-ghost px-2 py-1 text-xs">
        Edit
      </a>
      <button onClick={sync} disabled={busy} className="btn-ghost px-2 py-1 text-xs" title="Pull rating/photos from Google (needs API key)">
        Sync
      </button>
      <a href={`/cafes/${slug}`} className="btn-ghost px-2 py-1 text-xs" target="_blank" rel="noreferrer">
        View
      </a>
      <button onClick={remove} disabled={busy} className="btn-ghost px-2 py-1 text-xs text-danger">
        Delete
      </button>
    </div>
  );
}
