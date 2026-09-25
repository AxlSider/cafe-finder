"use client";

import dynamic from "next/dynamic";
import type { CafeSummary } from "@/lib/places/types";

const CafeMap = dynamic(() => import("@/components/CafeMap"), { ssr: false });

export function CafeDetailMap({ cafe }: { cafe: CafeSummary }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-card border border-ink-faint/20">
      <CafeMap cafes={[cafe]} origin={null} activeId={cafe.id} />
    </div>
  );
}
