import { clx } from "@modules/common/components/ui"
import type { HTMLAttributes } from "react"

const Eyebrow = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={clx("type-eyebrow text-serendipity-accent", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export default Eyebrow
