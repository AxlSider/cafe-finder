import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "../login/LoginForm";
import { CupScoutMark, Wordmark } from "@/components/Brand";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm space-y-5 py-4">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2">
          <CupScoutMark size={34} />
          <Wordmark className="text-2xl" />
        </div>
        <h1 className="font-display text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Save cafes, set your coffee profile, and get personalized picks.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 rounded-card skeleton" />}>
        <LoginForm mode="register" />
      </Suspense>
    </div>
  );
}
