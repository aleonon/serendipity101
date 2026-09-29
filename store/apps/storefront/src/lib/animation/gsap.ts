"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

let pluginsRegistered = false

/**
 * Register ScrollTrigger and useGSAP once, and only in the browser.
 * Client components should import gsap from here instead of calling
 * gsap.registerPlugin in each file.
 */
export function registerGsapPlugins() {
  if (pluginsRegistered || typeof window === "undefined") {
    return
  }

  gsap.registerPlugin(ScrollTrigger, useGSAP)
  pluginsRegistered = true
}

registerGsapPlugins()

export { gsap, ScrollTrigger, useGSAP }
