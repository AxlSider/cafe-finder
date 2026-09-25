import type { SVGProps } from "react";

/**
 * CupScout brand identity.
 * The mark fuses a coffee cup with a location pin — "scouting" great coffee.
 * It's geometric, single-weight, and legible from favicon to hero size.
 */
export function CupScoutMark({
  size = 28,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* Pin body */}
      <path
        d="M20 3.5c-7.2 0-12.5 5.3-12.5 12.2C7.5 24.5 20 36.5 20 36.5S32.5 24.5 32.5 15.7C32.5 8.8 27.2 3.5 20 3.5Z"
        fill="rgb(var(--brand-600))"
      />
      {/* Cup cutout */}
      <path
        d="M13 12.5h11v4.2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4.2Z"
        fill="rgb(var(--surface))"
      />
      <path
        d="M24 13.6h1.3a2.2 2.2 0 0 1 0 4.4H24"
        stroke="rgb(var(--surface))"
        strokeWidth="1.9"
        fill="none"
        strokeLinecap="round"
      />
      {/* Steam */}
      <path
        d="M16.4 8.6c.5.9-.5 1.5 0 2.5M20 8.6c.5.9-.5 1.5 0 2.5"
        stroke="rgb(var(--brand-200))"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight ${className}`}
      aria-hidden="true"
    >
      <span className="text-ink">Cup</span>
      <span className="text-brand-600">Scout</span>
    </span>
  );
}

export function Brand({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const markSize = size === "lg" ? 34 : size === "sm" ? 24 : 28;
  const text =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <CupScoutMark size={markSize} />
      <Wordmark className={text} />
      <span className="sr-only">CupScout</span>
    </span>
  );
}
