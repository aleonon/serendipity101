import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import React from "react"

type CtaLinkProps = {
  href: string
  /** Use "inverse" on dark surfaces. */
  variant?: "primary" | "secondary" | "inverse"
  className?: string
  children: React.ReactNode
  "data-testid"?: string
}

const baseClasses =
  "text-base-regular inline-flex h-12 items-center justify-center rounded-circle px-7 transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

const variantClasses = {
  primary:
    "bg-serendipity-primary text-serendipity-surface hover:bg-serendipity-ink focus-visible:ring-serendipity-primary focus-visible:ring-offset-serendipity-bg",
  secondary:
    "border border-serendipity-primary text-serendipity-primary hover:bg-serendipity-primary hover:text-serendipity-surface focus-visible:ring-serendipity-primary focus-visible:ring-offset-serendipity-bg",
  inverse:
    "bg-serendipity-surface text-serendipity-primary hover:bg-serendipity-bg focus-visible:ring-serendipity-surface focus-visible:ring-offset-serendipity-primary",
}

/** Shared call-to-action styling so section components don't repeat colors. */
const CtaLink = ({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: CtaLinkProps) => {
  return (
    <LocalizedClientLink
      href={href}
      className={clx(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default CtaLink
