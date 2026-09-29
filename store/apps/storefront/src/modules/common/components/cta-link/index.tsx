import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getButtonClasses } from "@modules/design-system/styles/button"
import type { SerendipityButtonVariant } from "@modules/design-system/styles/button"
import React from "react"

type CtaLinkProps = {
  href: string
  variant?: SerendipityButtonVariant
  className?: string
  children: React.ReactNode
  "data-testid"?: string
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
      className={getButtonClasses(variant, className)}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default CtaLink
