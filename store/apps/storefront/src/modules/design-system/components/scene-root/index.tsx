import { clx } from "@modules/common/components/ui"
import type { HTMLAttributes } from "react"

type SceneRootProps = HTMLAttributes<HTMLElement> & {
  scene: string
}

/**
 * Independent section root reserved for a future Scene wrapper
 * (GSAP / ScrollTrigger). This component has no animation behavior.
 */
const SceneRoot = ({
  scene,
  className,
  children,
  ...props
}: SceneRootProps) => {
  return (
    <section data-scene={scene} className={clx(className)} {...props}>
      {children}
    </section>
  )
}

export default SceneRoot
