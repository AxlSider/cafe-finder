"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPin, Coffee, Bookmark } from "@/components/icons";

const TABS = [
  { href: "/app", label: "Discover", Icon: Compass },
  { href: "/where", label: "Where", Icon: MapPin },
  { href: "/order", label: "Order", Icon: Coffee },
  { href: "/saved", label: "Saved", Icon: Bookmark },
];

/**
 * App-style bottom navigation (mobile only). Hidden on md+ and inside /admin.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  // Hidden inside admin and on the homepage (which has its own primary CTAs).
  if (pathname?.startsWith("/admin") || pathname === "/") return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-brand-600" : "text-ink-muted"
                }`}
              >
                <span
                  className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${
                    active ? "bg-brand-500/12" : ""
                  }`}
                >
                  <Icon size={22} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
