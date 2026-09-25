import type { Config } from "tailwindcss";

/**
 * CupScout design system.
 * Colors are token-driven: every value maps to a CSS variable (RGB channel
 * triplet) defined in globals.css, so the SAME class names work in light and
 * dark themes. Full documentation: docs/DESIGN-SYSTEM.md.
 *
 * Signature palette: warm amber/caramel "brand" as the single confident accent,
 * a fresh teal "accent" for freshness/specialty, on cool-neutral surfaces —
 * deliberately NOT an all-brown/beige theme.
 */
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: c("--brand-50"),
          100: c("--brand-100"),
          200: c("--brand-200"),
          300: c("--brand-300"),
          400: c("--brand-400"),
          500: c("--brand-500"),
          600: c("--brand-600"),
          700: c("--brand-700"),
          800: c("--brand-800"),
          900: c("--brand-900"),
        },
        accent: {
          400: c("--accent-400"),
          500: c("--accent-500"),
          600: c("--accent-600"),
          700: c("--accent-700"),
        },
        surface: {
          DEFAULT: c("--surface"),
          muted: c("--surface-muted"),
          sunken: c("--surface-sunken"),
          raised: c("--surface-raised"),
        },
        ink: {
          DEFAULT: c("--ink"),
          soft: c("--ink-soft"),
          muted: c("--ink-muted"),
          faint: c("--ink-faint"),
        },
        line: c("--line"),
        success: c("--success"),
        warning: c("--warning"),
        danger: c("--danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / 0.05), 0 2px 8px rgb(var(--shadow) / 0.06)",
        pop: "0 10px 30px rgb(var(--shadow) / 0.14)",
        float: "0 16px 48px rgb(var(--shadow) / 0.18)",
        focus: "0 0 0 3px rgb(var(--brand-400) / 0.35)",
      },
      maxWidth: {
        content: "76rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s var(--ease-spring) both",
        "fade-in": "fade-in 0.4s ease both",
        "scale-in": "scale-in 0.35s var(--ease-spring) both",
        "sheet-up": "sheet-up 0.32s var(--ease-emphasized) both",
      },
    },
  },
  plugins: [],
};

export default config;
