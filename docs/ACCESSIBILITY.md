# Accessibility

**Target:** WCAG 2.1 AA (aspirational; audited incrementally).

## Implemented
- **Semantic structure:** `header`/`main`/`footer`/`nav`/`article`/`section`;
  a **Skip to content** link; one `h1` per page.
- **Keyboard:** all controls are native `button`/`a`/`input`/`select`; visible
  `:focus-visible` ring (`globals.css`) on every interactive element.
- **Labels:** inputs have associated labels (some `sr-only`); search uses
  `role="search"`; category chips use `aria-pressed`; the list/map toggle uses
  `role="tab"`/`aria-selected`; location search uses `role="combobox"`/`listbox`.
- **Touch targets:** buttons and fields are **≥ 44px**.
- **Color independence:** open/closed and status use text labels, not color only.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` neutralizes
  animations/transitions globally.
- **Map:** container has `role="application"` + `aria-label`; the list provides a
  non-map path to every cafe.
- **Errors:** stated in text near the relevant control, not by color alone.

## Known gaps / follow-ups
- Full screen-reader pass on the map interaction and the combobox option
  navigation (arrow-key selection) is pending.
- Automated contrast audit across all brand tints to confirm AA on every
  pairing (primary combinations verified manually).
- Focus management on route transitions (move focus to `h1`) to add.

## How to check
- Keyboard-only walkthrough of the core loop.
- `design:accessibility-review` skill / axe DevTools for contrast + roles.
