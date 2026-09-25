"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics/client";
import { Check } from "@/components/icons";

const KINDS: { value: string; label: string }[] = [
  { value: "WRONG_LOCATION", label: "Wrong location" },
  { value: "WRONG_HOURS", label: "Wrong hours" },
  { value: "CLOSED", label: "Cafe is closed" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "WRONG_MENU", label: "Incorrect menu" },
  { value: "WRONG_INFO", label: "Incorrect information" },
  { value: "WRONG_PHOTO", label: "Wrong photo" },
];

export function ReportForm({
  cafeId,
  cafeName,
  slug,
}: {
  cafeId: string;
  cafeName: string;
  slug: string;
}) {
  const [kind, setKind] = useState(KINDS[0]!.value);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeId, kind, details: details || undefined }),
      });
      if (res.ok) track("report_submitted", { kind });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-500/12 text-accent-600">
          <Check size={28} />
        </div>
        <h2 className="mt-3 font-display font-bold">Thanks for the report</h2>
        <p className="mt-1 text-ink-muted">
          Our team will review your report for {cafeName}.
        </p>
        <Link href={`/cafes/${slug}`} className="btn-secondary mt-4">
          Back to cafe
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label htmlFor="kind" className="mb-1 block text-sm font-medium">
          What&apos;s wrong?
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="field"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="details" className="mb-1 block text-sm font-medium">
          Details <span className="text-ink-muted">(optional)</span>
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          maxLength={1000}
          className="field"
          placeholder="Tell us what should be corrected."
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-danger">
          Couldn&apos;t send your report. Please try again.
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit report"}
        </button>
        <Link href={`/cafes/${slug}`} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
