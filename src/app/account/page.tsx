import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CoffeeProfileForm } from "./CoffeeProfileForm";
import { Bookmark, Coffee, Shield } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const initial = (user.displayName ?? user.email)[0]?.toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-500 text-xl font-bold text-white">
          {initial}
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold">
            {user.displayName ?? "Your account"}
          </h1>
          <p className="text-sm text-ink-muted">
            {user.email}
            {user.role === "ADMIN" && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-soft">
                <Shield size={12} /> Admin
              </span>
            )}
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold">Coffee profile</h2>
        <CoffeeProfileForm />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/saved" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-pop">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/12 text-brand-600">
            <Bookmark size={20} />
          </span>
          <span>
            <span className="block font-medium text-ink">Saved cafes</span>
            <span className="block text-xs text-ink-muted">Your collection</span>
          </span>
        </Link>
        <Link href="/order" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-pop">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-500/12 text-accent-600">
            <Coffee size={20} />
          </span>
          <span>
            <span className="block font-medium text-ink">What to order</span>
            <span className="block text-xs text-ink-muted">Personalized picks</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
