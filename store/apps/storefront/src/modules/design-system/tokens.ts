/**
 * Named pointers to CSS custom properties. Keep values in `styles/globals.css`
 * so Tailwind, layout components, and a future GSAP layer share one source.
 * Importing this file does not attach animation behavior.
 */
export const serendipityTokens = {
  color: {
    bg: "rgb(var(--serendipity-bg))",
    surface: "rgb(var(--serendipity-surface))",
    primary: "rgb(var(--serendipity-primary))",
    primaryStrong: "rgb(var(--serendipity-primary-strong))",
    sage: "rgb(var(--serendipity-sage))",
    sageSoft: "rgb(var(--serendipity-sage-soft))",
    accent: "rgb(var(--serendipity-accent))",
    ink: "rgb(var(--serendipity-ink))",
    muted: "rgb(var(--serendipity-muted))",
    border: "rgb(var(--serendipity-border))",
    borderStrong: "rgb(var(--serendipity-border-strong))",
  },
  space: {
    gutter: "var(--serendipity-gutter)",
    section: "var(--serendipity-section-space)",
    sectionCompact: "var(--serendipity-section-space-compact)",
    container: "var(--serendipity-container)",
  },
  type: {
    hero: "var(--serendipity-type-hero)",
    section: "var(--serendipity-type-section)",
    subsection: "var(--serendipity-type-subsection)",
    bodyLarge: "var(--serendipity-type-body-large)",
  },
  motion: {
    ease: "var(--serendipity-ease)",
    durationFast: "var(--serendipity-duration-fast)",
    durationBase: "var(--serendipity-duration-base)",
    durationSlow: "var(--serendipity-duration-slow)",
  },
} as const

export type SerendipityTokens = typeof serendipityTokens
