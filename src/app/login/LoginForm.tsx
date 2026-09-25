"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Combined login / register form. On success, migrates any guest (localStorage)
 * saved cafes to the server, then redirects.
 */
export function LoginForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = params.get("next") || "/";

  async function migrateGuestSaves() {
    try {
      const raw = window.localStorage.getItem("cf:saved-cafes");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      await Promise.all(
        ids.map((cafeId) =>
          fetch("/api/favorites/cafes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cafeId }),
          }).catch(() => {}),
        ),
      );
      window.localStorage.removeItem("cf:saved-cafes");
    } catch {
      /* ignore */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register"
            ? { email, password, displayName: displayName || undefined }
            : { email, password },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      await migrateGuestSaves();
      await refresh();
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {mode === "register" && (
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Name <span className="text-ink-muted">(optional)</span>
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field"
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
        {mode === "register" && (
          <p className="mt-1 text-xs text-ink-muted">At least 8 characters.</p>
        )}
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-brand-700 underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-brand-700 underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
