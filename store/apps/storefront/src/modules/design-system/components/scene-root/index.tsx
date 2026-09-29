import { clx } from "@modules/common/components/ui"
import { forwardRef, type HTMLAttributes } from "react"

type SceneRootProps = HTMLAttributes<HTMLElement> & {
  scene: string
}

/**
 * Independent section root reserved for a future Scene wrapper
 * (GSAP / ScrollTrigger). This component has no animation behavior.
 * The forwarded ref is the future section timeline target.
 */
const SceneRoot = forwardRef<HTMLElement, SceneRootProps>(function SceneRoot(
  { scene, className, children, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      data-scene={scene}
      className={clx(className)}
      {...props}
    >
      {children}
    </section>
  )
})

export default SceneRoot
