"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  key: string;
  label: string;
}

export interface CafeFormValues {
  name: string;
  slug: string;
  region: "LUZON" | "SWITZERLAND";
  locality: string;
  address: string;
  latitude: string;
  longitude: string;
  rating: string;
  reviewCount: string;
  priceLevel: "" | "BUDGET" | "MODERATE" | "EXPENSIVE";
  phone: string;
  website: string;
  description: string;
  ratingSource: string;
  photoUrl: string;
  photoAttribution: string;
  googlePlaceId: string;
  featured: boolean;
  featuredRank: string;
  tags: string[];
  amenities: string[];
}

const EMPTY: CafeFormValues = {
  name: "",
  slug: "",
  region: "LUZON",
  locality: "",
  address: "",
  latitude: "",
  longitude: "",
  rating: "",
  reviewCount: "",
  priceLevel: "",
  phone: "",
  website: "",
  description: "",
  ratingSource: "",
  photoUrl: "",
  photoAttribution: "",
  googlePlaceId: "",
  featured: false,
  featuredRank: "",
  tags: [],
  amenities: [],
};

export function CafeForm({
  mode,
  id,
  initial,
  tagOptions,
  amenityOptions,
}: {
  mode: "new" | "edit";
  id?: string;
  initial?: Partial<CafeFormValues>;
  tagOptions: Option[];
  amenityOptions: Option[];
}) {
  const router = useRouter();
  const [v, setV] = useState<CafeFormValues>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      set("photoUrl", data.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function set<K extends keyof CafeFormValues>(key: K, value: CafeFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }
  function toggleIn(list: "tags" | "amenities", key: string) {
    setV((prev) => ({
      ...prev,
      [list]: prev[list].includes(key)
        ? prev[list].filter((k) => k !== key)
        : [...prev[list], key],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      name: v.name,
      slug: v.slug,
      region: v.region,
      locality: v.locality,
      address: v.address || null,
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      rating: v.rating === "" ? null : Number(v.rating),
      reviewCount: v.reviewCount === "" ? null : Number(v.reviewCount),
      priceLevel: v.priceLevel === "" ? null : v.priceLevel,
      phone: v.phone || null,
      website: v.website || "",
      description: v.description || null,
      ratingSource: v.ratingSource || null,
      photoUrl: v.photoUrl || null,
      photoAttribution: v.photoAttribution || null,
      googlePlaceId: v.googlePlaceId || null,
      featured: v.featured,
      featuredRank: v.featuredRank === "" ? null : Number(v.featuredRank),
      tags: v.tags,
      amenities: v.amenities,
    };

    try {
      const res = await fetch(
        mode === "new" ? "/api/admin/cafes" : `/api/admin/cafes/${id}`,
        {
          method: mode === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      router.push("/admin/cafes");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const input = (
    label: string,
    key: keyof CafeFormValues,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        className="field"
        value={v[key] as string}
        onChange={(e) => set(key, e.target.value as never)}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {input("Name", "name", { required: true })}
        {input("Slug", "slug", { required: true, placeholder: "lowercase-dashes" })}
        <div>
          <label className="mb-1 block text-sm font-medium">Region</label>
          <select
            className="field"
            value={v.region}
            onChange={(e) => set("region", e.target.value as CafeFormValues["region"])}
          >
            <option value="LUZON">Luzon</option>
            <option value="SWITZERLAND">Switzerland</option>
          </select>
        </div>
        {input("Locality", "locality", { required: true })}
        {input("Latitude", "latitude", { required: true, type: "number", step: "any" })}
        {input("Longitude", "longitude", { required: true, type: "number", step: "any" })}
        {input("Rating (leave blank if unknown)", "rating", { type: "number", step: "0.1", min: 0, max: 5 })}
        {input("Review count", "reviewCount", { type: "number", min: 0 })}
        <div>
          <label className="mb-1 block text-sm font-medium">Price level</label>
          <select
            className="field"
            value={v.priceLevel}
            onChange={(e) => set("priceLevel", e.target.value as CafeFormValues["priceLevel"])}
          >
            <option value="">Unknown</option>
            <option value="BUDGET">Budget ($)</option>
            <option value="MODERATE">Moderate ($$)</option>
            <option value="EXPENSIVE">Expensive ($$$)</option>
          </select>
        </div>
        {input("Rating source", "ratingSource", { placeholder: "e.g. Google" })}
        {input("Phone", "phone")}
        {input("Website", "website", { type: "url", placeholder: "https://" })}
      </div>

      {input("Address", "address")}

      {/* Photo (rights-cleared upload) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Photo</label>
        <div className="flex items-start gap-4">
          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-sunken">
            {v.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.photoUrl} alt="Cafe preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-ink-faint">
                No photo
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary"
                disabled={uploading}
              >
                {uploading ? "Uploading…" : v.photoUrl ? "Replace photo" : "Upload photo"}
              </button>
              {v.photoUrl && (
                <button type="button" onClick={() => set("photoUrl", "")} className="btn-ghost text-danger">
                  Remove
                </button>
              )}
            </div>
            <p className="max-w-sm text-xs text-ink-muted">
              JPEG/PNG/WebP, ≤5 MB. Only upload images you have the rights to use.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {input("Photo credit / attribution", "photoAttribution", { placeholder: "e.g. © Owner" })}
        {input("Google Place ID (optional)", "googlePlaceId", { placeholder: "for future rating sync" })}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          className="field"
          rows={3}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Tags (editorial)</legend>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleIn("tags", t.key)}
              aria-pressed={v.tags.includes(t.key)}
              className={`chip ${v.tags.includes(t.key) ? "chip-active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Amenities (editorial)</legend>
        <div className="flex flex-wrap gap-2">
          {amenityOptions.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => toggleIn("amenities", a.key)}
              aria-pressed={v.amenities.includes(a.key)}
              className={`chip ${v.amenities.includes(a.key) ? "chip-active" : ""}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured
        </label>
        {v.featured && (
          <div>
            <label className="mb-1 block text-xs">Rank</label>
            <input
              className="field w-24"
              type="number"
              value={v.featuredRank}
              onChange={(e) => set("featuredRank", e.target.value)}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : mode === "new" ? "Create cafe" : "Save changes"}
        </button>
        <a href="/admin/cafes" className="btn-ghost">
          Cancel
        </a>
      </div>
      <p className="text-xs text-ink-muted">
        Reminder: don&apos;t enter ratings/hours you can&apos;t verify — leave them blank.
        See docs/DATA-SOURCES.md.
      </p>
    </form>
  );
}
