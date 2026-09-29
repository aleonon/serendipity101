"use client"

import { gsap, useGSAP } from "@lib/animation/gsap"
import { FULL_MOTION_QUERY } from "@lib/animation/reduced-motion"
import { clx } from "@modules/common/components/ui"
import { useRef, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  /** Small vertical offset in pixels. Transform only. */
  y?: number
  fade?: boolean
}

const Reveal = ({
  children,
  className,
  delay = 0,
  duration = 0.8,
  y = 16,
  fade = true,
}: RevealProps) => {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const target = scope.current

      if (!target) {
        return
      }

      const motion = gsap.matchMedia()

      motion.add(FULL_MOTION_QUERY, () => {
        gsap.from(target, {
          opacity: fade ? 0 : 1,
          y,
          delay,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: target,
            start: "top 88%",
            once: true,
            markers: false,
          },
        })
      })

      return () => motion.revert()
    },
    { scope, dependencies: [delay, duration, y, fade] }
  )

  return (
    <div ref={scope} className={clx(className)}>
      {children}
    </div>
  )
}

export default Reveal
