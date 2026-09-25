"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { Marker } from "leaflet";
import type { CafeSummary } from "@/lib/places/types";
import type { LatLng } from "@/lib/geo";
import { Search } from "@/components/icons";

/**
 * Interactive map (vanilla Leaflet + marker clustering).
 * This component is only ever loaded client-side (next/dynamic ssr:false), so we
 * import Leaflet + the cluster plugin statically — that guarantees the plugin
 * extends the same Leaflet instance (dynamic import() split them, breaking
 * `markerClusterGroup`).
 *
 * - Free OSM tiles, softened via a CSS filter (dark map in dark mode).
 * - Cafe pins are clustered into brand-styled count bubbles that expand on zoom.
 * - User location is a separate teal dot; "Search this area" re-centers search.
 */
export default function CafeMap({
  cafes,
  origin,
  activeId,
  onSelect,
  onSearchArea,
}: {
  cafes: CafeSummary[];
  origin: LatLng | null;
  activeId: string | null;
  onSelect?: (id: string) => void;
  onSearchArea?: (center: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const didInitialFit = useRef(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = origin
      ? [origin.lat, origin.lng]
      : cafes[0]
        ? [cafes[0].location.lat, cafes[0].location.lng]
        : [16.4, 120.6];

    const map = L.map(containerRef.current, {
      center,
      zoom: origin ? 14 : 12,
      scrollWheelZoom: true,
    });

    L.tileLayer(
      process.env.NEXT_PUBLIC_MAP_TILE_URL ??
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ).addTo(map);

    // Soften the busy OSM palette; render a proper dark map in dark mode.
    const pane = map.getPane("tilePane");
    if (pane) {
      const dark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia?.("(prefers-color-scheme: dark)").matches);
      pane.style.filter = dark
        ? "grayscale(0.35) brightness(0.72) contrast(0.95) invert(0.92) hue-rotate(180deg)"
        : "saturate(0.82) brightness(1.02)";
    }

    userLayerRef.current = L.layerGroup().addTo(map);

    clusterRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => {
        const n = cluster.getChildCount();
        const size = n < 10 ? 36 : n < 50 ? 44 : 52;
        return L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:rgba(165,74,22,.92);color:#fff;border:3px solid #fff;border-radius:9999px;box-shadow:0 3px 10px rgba(0,0,0,.32);font-weight:700;font-size:${n < 100 ? 13 : 12}px">${n}</div>`,
          iconSize: [size, size],
        });
      },
    });
    map.addLayer(clusterRef.current);

    map.on("dragend zoomend", () => setMoved(true));
    mapRef.current = map;
    // Ensure correct sizing once visible; guard against a strict-mode/unmount
    // race where the timeout would fire after the map has been removed.
    const sizeTimer = setTimeout(() => {
      if (mapRef.current === map) map.invalidateSize();
    }, 0);
    renderMarkers();

    return () => {
      clearTimeout(sizeTimer);
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      userLayerRef.current = null;
      didInitialFit.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes, origin, activeId]);

  function renderMarkers() {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const userLayer = userLayerRef.current;
    if (!map || !cluster || !userLayer) return;

    userLayer.clearLayers();
    cluster.clearLayers();
    markersRef.current = {};

    if (origin) {
      L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: "",
          html: `<span style="display:block;width:18px;height:18px;background:#0f8a76;border:3px solid white;border-radius:9999px;box-shadow:0 0 0 4px rgba(15,138,118,.3),0 1px 3px rgba(0,0,0,.3)"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(userLayer);
    }

    const bounds: [number, number][] = [];
    const clusterMarkers: Marker[] = [];
    for (const cafe of cafes) {
      const isActive = cafe.id === activeId;
      const w = isActive ? 40 : 30;
      const h = isActive ? 48 : 36;
      const marker = L.marker([cafe.location.lat, cafe.location.lng], {
        title: cafe.name,
        zIndexOffset: isActive ? 1000 : 0,
        icon: L.divIcon({
          className: "",
          html: `<div style="position:relative;width:${w}px;height:${h}px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))">
            <svg width="${w}" height="${h}" viewBox="0 0 30 36" fill="none">
              <path d="M15 1C7.8 1 2 6.6 2 13.5 2 22 15 35 15 35s13-13 13-21.5C28 6.6 22.2 1 15 1Z" fill="${isActive ? "#7c3a12" : "#a54a16"}" stroke="white" stroke-width="2"/>
              <circle cx="15" cy="13.5" r="4.5" fill="white"/>
            </svg>
          </div>`,
          iconSize: [w, h],
          iconAnchor: [w / 2, h],
        }),
      });
      marker.on("click", () => onSelect?.(cafe.id));
      markersRef.current[cafe.id] = marker;
      clusterMarkers.push(marker);
      bounds.push([cafe.location.lat, cafe.location.lng]);
    }
    cluster.addLayers(clusterMarkers);

    if (!didInitialFit.current) {
      if (origin) map.setView([origin.lat, origin.lng], cafes.length ? 14 : 13);
      else if (bounds.length > 1) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      else if (bounds.length === 1) map.setView(bounds[0]!, 14);
      didInitialFit.current = true;
    }
  }

  // Reveal + center the active cafe (expanding its cluster if needed).
  useEffect(() => {
    if (!activeId) return;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const marker = markersRef.current[activeId];
    if (!map || !cluster || !marker) return;
    // markercluster can throw during transitions/teardown — fall back to a pan.
    try {
      cluster.zoomToShowLayer(marker, () => map.panTo(marker.getLatLng()));
    } catch {
      try {
        map.panTo(marker.getLatLng());
      } catch {
        /* map already removed */
      }
    }
  }, [activeId]);

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <div ref={containerRef} role="application" aria-label="Map of nearby cafes" className="h-full w-full" />
      {moved && onSearchArea && (
        <button
          type="button"
          onClick={() => {
            const c = mapRef.current?.getCenter();
            if (c) onSearchArea({ lat: c.lat, lng: c.lng });
            setMoved(false);
          }}
          className="absolute left-1/2 top-3 z-[500] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-float ring-1 ring-line animate-fade-up"
        >
          <Search size={15} /> Search this area
        </button>
      )}
    </div>
  );
}
