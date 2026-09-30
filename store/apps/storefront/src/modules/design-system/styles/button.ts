import clsx from "clsx"

export type SerendipityButtonVariant =
  | "primary"
  | "secondary"
  | "inverse"
  | "ghost"

const baseClasses =
  "inline-flex min-h-12 items-center justify-center rounded-circle px-8 text-sm font-medium tracking-[0.04em] transition-colors duration-base ease-serendipity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const variants: Record<SerendipityButtonVariant, string> = {
  primary:
    "bg-serendipity-primary text-serendipity-surface hover:bg-serendipity-primary-strong focus-visible:ring-serendipity-primary focus-visible:ring-offset-serendipity-bg",
  secondary:
    "border border-serendipity-primary/80 bg-serendipity-surface/70 text-serendipity-primary hover:border-serendipity-primary hover:bg-serendipity-primary hover:text-serendipity-surface focus-visible:ring-serendipity-primary focus-visible:ring-offset-serendipity-bg",
  inverse:
    "bg-serendipity-surface text-serendipity-primary hover:bg-serendipity-bg focus-visible:ring-serendipity-surface focus-visible:ring-offset-serendipity-primary",
  ghost:
    "text-serendipity-primary hover:bg-serendipity-sage-soft focus-visible:ring-serendipity-primary focus-visible:ring-offset-serendipity-bg",
}

export const getButtonClasses = (
  variant: SerendipityButtonVariant = "primary",
  className?: string
) => clsx(baseClasses, variants[variant], className)
