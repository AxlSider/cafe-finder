"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@/components/icons";

type Theme = "light" | "dark" | "system";

/**
 * Light/dark toggle. Persists to localStorage and sets `data-theme` on <html>.
 * Default (no attribute) follows the OS via prefers-color-scheme.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem("cf:theme") as Theme | null;
      if (saved) setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    try {
      window.localStorage.setItem("cf:theme", next);
    } catch {
      /* ignore */
    }
    const el = document.documentElement;
    if (next === "system") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", next);
  }

  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches));

  return (
    <button
      type="button"
      onClick={() => apply(isDark ? "light" : "dark")}
      className={`grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunken ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted && isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
