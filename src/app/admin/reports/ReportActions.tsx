"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: "RESOLVED" | "REJECTED" | "OPEN") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status !== "RESOLVED" && (
        <button onClick={() => setStatus("RESOLVED")} disabled={busy} className="btn-ghost px-2 py-1 text-xs text-success">
          Resolve
        </button>
      )}
      {status !== "REJECTED" && (
        <button onClick={() => setStatus("REJECTED")} disabled={busy} className="btn-ghost px-2 py-1 text-xs text-danger">
          Reject
        </button>
      )}
      {status !== "OPEN" && (
        <button onClick={() => setStatus("OPEN")} disabled={busy} className="btn-ghost px-2 py-1 text-xs">
          Reopen
        </button>
      )}
    </div>
  );
}
