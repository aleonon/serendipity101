"use client"

import { useEffect, useState } from "react"

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
export const FULL_MOTION_QUERY = "(prefers-reduced-motion: no-preference)"

/**
 * Safe during SSR and before hydration: assume reduced motion so nothing
 * is hidden while waiting on JavaScript. After mount, follows the OS setting.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const sync = () => setReduced(media.matches)

    sync()
    media.addEventListener("change", sync)

    return () => media.removeEventListener("change", sync)
  }, [])

  return reduced
}
