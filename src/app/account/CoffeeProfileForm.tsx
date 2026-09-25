"use client";

import { useEffect, useState } from "react";
import { Check } from "@/components/icons";

const PREFS: { key: string; label: string; group: string }[] = [
  { key: "sweet", label: "Sweet", group: "Taste" },
  { key: "bitter", label: "Bitter", group: "Taste" },
  { key: "strong", label: "Strong", group: "Taste" },
  { key: "light", label: "Light", group: "Taste" },
  { key: "milkBased", label: "Milk-based", group: "Style" },
  { key: "black", label: "Black coffee", group: "Style" },
  { key: "matcha", label: "Matcha", group: "Style" },
  { key: "tea", label: "Tea", group: "Style" },
  { key: "chocolate", label: "Chocolate", group: "Style" },
  { key: "hot", label: "Hot", group: "Temperature" },
  { key: "iced", label: "Iced", group: "Temperature" },
];

type Prefs = Record<string, boolean>;

export function CoffeeProfileForm() {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved">(
    "loading",
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" });
        const data = await res.json();
        const p: Prefs = {};
        if (data.preference) {
          for (const { key } of PREFS) p[key] = !!data.preference[key];
        }
        setPrefs(p);
      } catch {
        /* ignore */
      } finally {
        setStatus("idle");
      }
    })();
  }, []);

  const toggle = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  async function save() {
    setStatus("saving");
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("idle");
    }
  }

  if (status === "loading") {
    return <div className="card h-40 animate-pulse bg-surface-sunken" />;
  }

  const groups = Array.from(new Set(PREFS.map((p) => p.group)));

  return (
    <div className="card space-y-4 p-6">
      <p className="text-sm text-ink-muted">
        Pick what you like. We use these only to explain and personalize
        recommendations — no tracking. <a href="/order" className="underline">Try “What to order”</a>.
      </p>
      {groups.map((group) => (
        <fieldset key={group}>
          <legend className="mb-2 text-sm font-semibold">{group}</legend>
          <div className="flex flex-wrap gap-2">
            {PREFS.filter((p) => p.group === group).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => toggle(p.key)}
                aria-pressed={!!prefs[p.key]}
                className={`chip ${prefs[p.key] ? "chip-active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save profile"}
        </button>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 text-sm text-success" role="status">
            <Check size={15} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
