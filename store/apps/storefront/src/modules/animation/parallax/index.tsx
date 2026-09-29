"use client"

import { gsap, useGSAP } from "@lib/animation/gsap"
import { FULL_MOTION_QUERY } from "@lib/animation/reduced-motion"
import { clx } from "@modules/common/components/ui"
import { useRef, type ReactNode } from "react"

type ParallaxProps = {
  children: ReactNode
  className?: string
  /** Peak vertical travel in pixels on desktop. Mobile uses less. */
  distance?: number
}

const Parallax = ({ children, className, distance = 16 }: ParallaxProps) => {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const target = scope.current

      if (!target) {
        return
      }

      const trigger = target.parentElement ?? target
      const motion = gsap.matchMedia()

      const animate = (travel: number) => {
        gsap.fromTo(
          target,
          { y: -travel },
          {
            y: travel,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              markers: false,
            },
          }
        )
      }

      motion.add(
        `${FULL_MOTION_QUERY} and (max-width: 767px)`,
        () => animate(Math.round(distance * 0.4))
      )
      motion.add(
        `${FULL_MOTION_QUERY} and (min-width: 768px)`,
        () => animate(distance)
      )

      return () => motion.revert()
    },
    { scope, dependencies: [distance] }
  )

  return (
    <div ref={scope} className={clx(className)}>
      {children}
    </div>
  )
}

export default Parallax
