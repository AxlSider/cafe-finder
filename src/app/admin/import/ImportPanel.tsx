"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IMPORT_AREAS } from "@/lib/places/import/presets";
import { MapPin } from "@/components/icons";

type Result = { created: number; updated: number; total: number; locality: string };

export function ImportPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(place: string) {
    setBusy(place);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Import failed.");
      else {
        setResult(data);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="text-sm text-ink-soft">
          Import real cafes from <strong>OpenStreetMap</strong> for a city. Free,
          no key. OSM has no ratings, so ratings stay &ldquo;unavailable&rdquo;
          until curated or synced from Google — this adds real names, locations,
          websites, some amenities and hours. Re-importing refreshes existing
          entries (matched by OSM id), never duplicates.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {IMPORT_AREAS.map((a) => (
            <button
              key={a.key}
              onClick={() => run(a.key)}
              disabled={busy !== null}
              className="btn-secondary"
            >
              <MapPin size={15} />
              {busy === a.key ? "Importing…" : a.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="card p-4 text-sm">
          <p className="font-medium text-ink">
            Imported {result.locality}: {result.created} new, {result.updated}{" "}
            updated ({result.total} found).
          </p>
          <p className="mt-1 text-ink-muted">
            Data © OpenStreetMap contributors.
          </p>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
