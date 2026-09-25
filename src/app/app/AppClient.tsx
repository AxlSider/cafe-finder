"use client";

import { useSearchParams } from "next/navigation";
import { DiscoverExperience } from "@/components/DiscoverExperience";

// Named demo cities for one-click deep links from the landing page.
const CITIES: Record<string, { lat: number; lng: number; label: string }> = {
  baguio: { lat: 16.4023, lng: 120.596, label: "Baguio" },
  makati: { lat: 14.5547, lng: 121.0244, label: "Makati" },
  manila: { lat: 14.5995, lng: 120.9842, label: "Manila" },
  quezon: { lat: 14.676, lng: 121.0437, label: "Quezon City" },
  taguig: { lat: 14.5509, lng: 121.0487, label: "Taguig" },
  tuguegarao: { lat: 17.6132, lng: 121.727, label: "Tuguegarao" },
  vigan: { lat: 17.5747, lng: 120.3869, label: "Vigan" },
  dagupan: { lat: 16.0431, lng: 120.3339, label: "Dagupan" },
  naga: { lat: 13.6218, lng: 123.1948, label: "Naga" },
  batangas: { lat: 13.7565, lng: 121.0583, label: "Batangas" },
  zurich: { lat: 47.3769, lng: 8.5417, label: "Zürich" },
  geneva: { lat: 46.2044, lng: 6.1432, label: "Genève" },
};

export function AppClient() {
  const params = useSearchParams();
  const place = params.get("place")?.toLowerCase();
  const lat = params.get("lat");
  const lng = params.get("lng");

  let initialOrigin: { lat: number; lng: number } | null = null;
  let initialLocality: string | null = null;

  if (place && CITIES[place]) {
    initialOrigin = { lat: CITIES[place]!.lat, lng: CITIES[place]!.lng };
    initialLocality = CITIES[place]!.label;
  } else if (lat && lng) {
    initialOrigin = { lat: Number(lat), lng: Number(lng) };
    initialLocality = params.get("label");
  }

  return (
    <DiscoverExperience
      initialOrigin={initialOrigin}
      initialLocality={initialLocality}
    />
  );
}
