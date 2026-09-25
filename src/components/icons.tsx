import type { SVGProps } from "react";

/**
 * CupScout icon set — a single, consistent, stroke-based system (no emoji).
 * All icons inherit `currentColor` and a 1.75 stroke, sized 20px by default.
 * Decorative by default (aria-hidden); pass `aria-label` + `role="img"` when an
 * icon conveys meaning on its own.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MapPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);

export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Base>
);

export const Star = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.6l5.8-.8L12 3.5Z" />
  </Base>
);

export const Coffee = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
    <path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 2.5c.5 1-.5 1.5 0 2.5M11.5 2.5c.5 1-.5 1.5 0 2.5" />
  </Base>
);

export const Heart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-2.5C19 10.6 12 20 12 20Z" />
  </Base>
);

export const Bookmark = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M6 4h12v16l-6-4-6 4V4Z" />
  </Base>
);

export const Navigation = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4 4 11l7 2 2 7 7-16Z" />
  </Base>
);

export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const Wifi = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 9a15 15 0 0 1 19 0M6 12.5a10 10 0 0 1 12 0M9.5 16a5 5 0 0 1 5 0" />
    <circle cx="12" cy="19" r="0.6" fill="currentColor" />
  </Base>
);

export const Compass = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15 9-2 5-4 1 2-5 4-1Z" />
  </Base>
);

export const Sparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15l-1.7-4L6 9.3l4.3-1.7L12 3Z" />
    <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
  </Base>
);

export const User = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Base>
);

export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const Grid = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const Sliders = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="13" cy="18" r="2" />
  </Base>
);

export const Phone = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h3l1.5 4.5-2 1.5a11 11 0 0 0 5 5l1.5-2 4.5 1.5V21a1 1 0 0 1-1 1A17 17 0 0 1 5 5a1 1 0 0 1 1-2Z" />
  </Base>
);

export const Globe = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
  </Base>
);

export const Flag = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 21V4M6 4h11l-2 3 2 3H6" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const ChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 6-6 6 6 6" />
  </Base>
);

export const Sun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </Base>
);

export const Moon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 13.5A8 8 0 0 1 10.5 4a8 8 0 1 0 9.5 9.5Z" />
  </Base>
);

export const LogOut = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 12H3M6 8l-4 4 4 4" />
  </Base>
);

export const Shield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 2.5V11c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V5.5L12 3Z" />
  </Base>
);

export const BookOpen = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6c-1.5-1.2-3.5-1.8-6-1.8V17c2.5 0 4.5.6 6 1.8M12 6c1.5-1.2 3.5-1.8 6-1.8V17c-2.5 0-4.5.6-6 1.8M12 6v12.8" />
  </Base>
);

export const Briefcase = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
  </Base>
);

export const Users = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M17 14.3A5.5 5.5 0 0 1 20.5 20" />
  </Base>
);

export const Wallet = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M4 7.5H19a1 1 0 0 1 1 1V12" />
    <circle cx="16.5" cy="13.5" r="1" fill="currentColor" />
  </Base>
);

export const Leaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20c0-8 6-14 16-14 0 10-6 15-13 15-3 0-3-1-3-1Z" />
    <path d="M9 16c2-3 5-5 8-6" />
  </Base>
);

export const CloudOff = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 17a4 4 0 0 1-.5-8 6 6 0 0 1 10-2.5M18 9a4 4 0 0 1 1 7.9" />
    <path d="M3 3l18 18" />
  </Base>
);

export const Map = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
    <path d="M9 4v14M15 6v14" />
  </Base>
);

export const List = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Base>
);

export const Plug = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 2v5M15 2v5M6 7h12v3a6 6 0 0 1-12 0V7ZM12 16v6" />
  </Base>
);

export const Car = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 16v-3l2-5a2 2 0 0 1 1.9-1.3h8.2A2 2 0 0 1 18 8l2 5v3M4 16h16M4 16v2h2v-2M20 16v2h-2v-2" />
    <circle cx="7.5" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="16.5" cy="13.5" r="0.6" fill="currentColor" />
  </Base>
);

export const Trees = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 8 9h2.5L7 14h4v6M12 3l4 6h-2.5l3.5 5h-4" />
  </Base>
);

export const HeartHandshake = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-2.5C19 10.6 12 20 12 20Z" />
    <path d="M12 8.5 10.5 10a1.4 1.4 0 0 0 2 2l1-1 2 1.5" />
  </Base>
);

// Icon keyed by string — used for data-driven lists (categories/amenities).
import type { ComponentType } from "react";
export const iconByKey: Record<string, ComponentType<IconProps>> = {
  wifi: Wifi,
  outlets: Plug,
  parking: Car,
  outdoor: Trees,
  quiet: Leaf,
  study: BookOpen,
  work: Briefcase,
  date: HeartHandshake,
  hangout: Users,
  specialty: Sparkle,
  budget: Wallet,
  groups: Users,
  open_late: Moon,
  nearby: MapPin,
  open: Clock,
  rated: Star,
  late: Moon,
};
