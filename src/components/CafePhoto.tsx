"use client";

import { useState } from "react";
import { Coffee } from "@/components/icons";

/**
 * Cafe imagery. Prioritizes a real photo when one exists (admin upload,
 * Wikimedia/OSM, or a provider). When none is available — or a remote photo
 * fails to load — we render a branded, layered monogram tile (deterministic per
 * cafe) so a grid of them reads as a designed system, never a fabricated or
 * unrelated stock image.
 */
const TINTS = [
  "from-brand-400/30 via-brand-500/15 to-brand-600/10",
  "from-accent-400/30 via-accent-500/15 to-accent-600/10",
  "from-brand-300/28 via-accent-400/14 to-brand-500/10",
  "from-accent-500/26 via-brand-400/14 to-brand-500/10",
  "from-brand-500/26 via-brand-300/14 to-accent-500/10",
  "from-accent-600/24 via-accent-400/14 to-brand-400/10",
];

function seedOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function CafePhoto({
  name,
  photoUrl,
  photoAlt,
  className = "",
  rounded = "rounded-card",
  eager = false,
}: {
  name: string;
  photoUrl: string | null;
  photoAlt: string | null;
  className?: string;
  rounded?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={photoAlt ?? `${name} — cafe photo`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${rounded} ${className}`}
      />
    );
  }

  const seed = seedOf(name);
  const tint = TINTS[seed % TINTS.length];
  const rotate = (seed % 5) * 6 - 12; // -12..12deg

  return (
    <div
      role="img"
      aria-label={`${name} — no photo available`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-sunken ${rounded} ${className}`}
    >
      {/* tint wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />
      {/* soft top-left highlight for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 15% 10%, rgb(255 255 255 / 0.14), transparent 55%)",
        }}
      />
      {/* oversized decorative mark, bled into a corner */}
      <Coffee
        size={104}
        className="absolute -bottom-5 -right-4 text-ink/[0.07]"
        style={{ transform: `rotate(${rotate}deg)` }}
      />
      {/* monogram */}
      <span className="relative select-none font-display text-4xl font-extrabold tracking-tight text-ink/35">
        {name.slice(0, 2)}
      </span>
    </div>
  );
}
