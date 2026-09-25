"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserActions({
  id,
  suspended,
  isAdmin,
}: {
  id: string;
  suspended: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (isAdmin) return <span className="text-xs text-ink-muted">—</span>;

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !suspended }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`btn-ghost px-2 py-1 text-xs ${suspended ? "text-success" : "text-danger"}`}
    >
      {suspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}
