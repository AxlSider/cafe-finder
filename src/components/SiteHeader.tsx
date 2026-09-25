"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brand } from "@/components/Brand";
import { Shield, User, LogOut } from "@/components/icons";

const NAV = [
  { href: "/app", label: "Discover" },
  { href: "/where", label: "Where to go" },
  { href: "/order", label: "What to order" },
  { href: "/saved", label: "Saved" },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Admin lives in its own world — hide the consumer chrome there.
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link href="/" aria-label="CupScout home" className="shrink-0">
          <Brand />
        </Link>

        {!isAdmin && (
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-surface-sunken text-ink"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-9 rounded-full skeleton" />
          ) : user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink sm:flex"
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                aria-label="Your account"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white"
              >
                <span className="text-sm font-semibold">
                  {(user.displayName ?? user.email)[0]?.toUpperCase()}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                  router.refresh();
                }}
                aria-label="Log out"
                className="hidden h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken sm:grid"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary h-10 px-4 text-sm">
              <User size={16} />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
