import { Suspense } from "react";
import type { Metadata } from "next";
import { AppClient } from "./AppClient";

export const metadata: Metadata = {
  title: "Discover cafes",
  description: "Find great coffee near you across Luzon and Switzerland.",
};

// The location-first discovery experience. Client-driven (device geolocation);
// supports demo deep links like /app?place=baguio.
export default function AppPage() {
  return (
    <Suspense fallback={<div className="h-64 rounded-card skeleton" />}>
      <AppClient />
    </Suspense>
  );
}
