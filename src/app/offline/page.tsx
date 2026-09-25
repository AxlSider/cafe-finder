import Link from "next/link";
import type { Metadata } from "next";
import { CloudOff } from "@/components/icons";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
        <CloudOff size={30} />
      </div>
      <h1 className="mt-4 font-display text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="mx-auto mt-1 max-w-sm text-ink-muted">
        Some information may be unavailable. We avoid showing cached cafe details
        because they could be out of date. Reconnect to see fresh results.
      </p>
      <Link href="/" className="btn-primary mt-5">
        Try again
      </Link>
    </div>
  );
}
