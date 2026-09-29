import { clx } from "@modules/common/components/ui"
import type { HTMLAttributes } from "react"

type SectionContainerProps = HTMLAttributes<HTMLDivElement> & {
  spacing?: "none" | "compact" | "standard"
}

const spacingClasses = {
  none: "",
  compact: "section-space-compact",
  standard: "section-space",
}

/**
 * Stable layout boundary for editorial sections. Future Scene wrappers belong
 * outside this component, keeping spacing independent from animation behavior.
 */
const SectionContainer = ({
  spacing = "standard",
  className,
  children,
  ...props
}: SectionContainerProps) => {
  return (
    <div
      className={clx(
        "content-container",
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default SectionContainer
