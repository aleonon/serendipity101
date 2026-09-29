import { clx } from "@modules/common/components/ui"
import type { HTMLAttributes } from "react"

type EditorialHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3"
  size?: "hero" | "section" | "subsection"
}

const sizeClasses = {
  hero: "type-display-hero",
  section: "type-display-section",
  subsection: "type-display-subsection",
}

const EditorialHeading = ({
  as: Component = "h2",
  size = "section",
  className,
  children,
  ...props
}: EditorialHeadingProps) => {
  return (
    <Component
      className={clx(sizeClasses[size], "text-serendipity-primary", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export default EditorialHeading
