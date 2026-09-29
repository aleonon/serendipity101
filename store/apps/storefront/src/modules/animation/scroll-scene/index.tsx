"use client"

import { gsap, ScrollTrigger, useGSAP } from "@lib/animation/gsap"
import { FULL_MOTION_QUERY } from "@lib/animation/reduced-motion"
import { clx } from "@modules/common/components/ui"
import { useRef, type ReactNode } from "react"

type ScrollSceneProps = {
  children: ReactNode
  className?: string
  start?: string
  end?: string
  scrub?: boolean | number
  /**
   * Pinning is desktop-only. Reduced motion and viewports under 1024px
   * never pin.
   */
  pin?: boolean
  markers?: boolean
  /**
   * Optional timeline for a later scene. Returning nothing skips
   * ScrollTrigger entirely, so the wrapper stays layout-only.
   */
  setup?: (scope: HTMLElement) => gsap.core.Animation | void
}

const ScrollScene = ({
  children,
  className,
  start = "top 80%",
  end = "bottom 20%",
  scrub = false,
  pin = false,
  markers = false,
  setup,
}: ScrollSceneProps) => {
  const scope = useRef<HTMLDivElement>(null)
  const setupRef = useRef(setup)
  setupRef.current = setup

  useGSAP(
    () => {
      const root = scope.current
      const build = setupRef.current

      if (!root || !build) {
        return
      }

      const query = pin
        ? `${FULL_MOTION_QUERY} and (min-width: 1024px)`
        : FULL_MOTION_QUERY
      const motion = gsap.matchMedia()

      motion.add(query, () => {
        const animation = build(root)

        if (!animation) {
          return
        }

        ScrollTrigger.create({
          trigger: root,
          start,
          end,
          scrub,
          pin,
          markers,
          animation,
        })
      })

      return () => motion.revert()
    },
    { scope, dependencies: [start, end, scrub, pin, markers] }
  )

  return (
    <div ref={scope} className={clx(className)}>
      {children}
    </div>
  )
}

export default ScrollScene
