"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/lib/geo";

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

interface GeoState {
  status: GeoStatus;
  coords: LatLng | null;
  error: string | null;
}

/**
 * Wraps the browser Geolocation API. Deliberately does NOT auto-request on
 * mount — the UI explains why first, then calls request() (see docs/LOCATION.md).
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    status: "idle",
    coords: null,
    error: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "unavailable",
        coords: null,
        error: "Geolocation isn't supported on this device.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "prompting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "granted",
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({
            status: "denied",
            coords: null,
            error: "Location access was denied.",
          });
        } else {
          setState({
            status: "error",
            coords: null,
            error: "We couldn't determine your location.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const setManual = useCallback((coords: LatLng) => {
    setState({ status: "granted", coords, error: null });
  }, []);

  return { ...state, request, setManual };
}
