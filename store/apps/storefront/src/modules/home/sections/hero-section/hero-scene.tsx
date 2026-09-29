"use client"

import { gsap, useGSAP } from "@lib/animation/gsap"
import { FULL_MOTION_QUERY } from "@lib/animation/reduced-motion"
import BotanicalMark from "@modules/design-system/components/botanical-mark"
import SceneRoot from "@modules/design-system/components/scene-root"
import SectionContainer from "@modules/design-system/components/section-container"
import { useRef, type ReactNode } from "react"
import HeroBotanicalLayer from "./hero-botanical-layer"
import HeroVisual from "./hero-visual"

const DESKTOP_SCENE = `${FULL_MOTION_QUERY} and (min-width: 1024px)`
const COMPACT_SCENE = `${FULL_MOTION_QUERY} and (max-width: 1023px)`

const LEAF_LEFT = "/serendipity/hero/leaf_left.svg"
const LEAF_RIGHT = "/serendipity/hero/leaf_right.png"
const FLOWER_01 = "/serendipity/hero/flower_01.svg"
const FLOWER_02 = "/serendipity/hero/flower_02.png"

type HeroSceneProps = {
  copy: ReactNode
}

type SceneTargets = {
  section: HTMLElement
  background: HTMLElement
  copy: HTMLElement
  product: HTMLElement
  leafLeft: HTMLElement
  leafRight: HTMLElement
  flower01: HTMLElement
  flower02: HTMLElement
}

/**
 * One scrubbed timeline for the hero. Desktop may pin; compact viewports
 * and reduced motion never do. Tweens target wrappers, not Next Image nodes.
 */
const HeroScene = ({ copy }: HeroSceneProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const productRef = useRef<HTMLDivElement>(null)
  const leafLeftRef = useRef<HTMLDivElement>(null)
  const leafRightRef = useRef<HTMLDivElement>(null)
  const flower01Ref = useRef<HTMLDivElement>(null)
  const flower02Ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const targets = readTargets({
        section: sectionRef.current,
        background: backgroundRef.current,
        copy: copyRef.current,
        product: productRef.current,
        leafLeft: leafLeftRef.current,
        leafRight: leafRightRef.current,
        flower01: flower01Ref.current,
        flower02: flower02Ref.current,
      })

      if (!targets) {
        return
      }

      const motion = gsap.matchMedia()

      motion.add(DESKTOP_SCENE, () => {
        buildDesktopTimeline(targets)
      })

      motion.add(COMPACT_SCENE, () => {
        buildCompactTimeline(targets)
      })

      return () => motion.revert()
    },
    { scope: sectionRef }
  )

  return (
    <SceneRoot
      ref={sectionRef}
      scene="hero"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-serendipity-border"
    >
      <div
        ref={backgroundRef}
        className="pointer-events-none absolute -left-10 top-10 h-64 w-32 opacity-30 small:h-96 small:w-48"
      >
        <BotanicalMark className="h-full w-full" />
      </div>

      <SectionContainer className="relative grid items-center gap-10 small:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] small:gap-16">
        <div ref={copyRef} className="relative z-20 min-w-0">
          {copy}
        </div>

        <div className="relative z-10 min-w-0 w-full">
          <HeroBotanicalLayer
            ref={leafLeftRef}
            src={LEAF_LEFT}
            className="z-10"
          />
          <div ref={productRef} className="relative z-20">
            <HeroVisual />
          </div>
          <HeroBotanicalLayer
            ref={flower02Ref}
            src={FLOWER_02}
            className="z-30"
          />
          <HeroBotanicalLayer
            ref={flower01Ref}
            src={FLOWER_01}
            className="z-30"
          />
          <HeroBotanicalLayer
            ref={leafRightRef}
            src={LEAF_RIGHT}
            className="z-30"
          />
        </div>
      </SectionContainer>
    </SceneRoot>
  )
}

function readTargets(targets: {
  [Key in keyof SceneTargets]: SceneTargets[Key] | null
}): SceneTargets | null {
  if (
    !targets.section ||
    !targets.background ||
    !targets.copy ||
    !targets.product ||
    !targets.leafLeft ||
    !targets.leafRight ||
    !targets.flower01 ||
    !targets.flower02
  ) {
    return null
  }

  return targets as SceneTargets
}

function buildDesktopTimeline(targets: SceneTargets) {
  const { section, background, copy, product, leafLeft, leafRight, flower01, flower02 } =
    targets

  gsap.set([product, leafLeft, leafRight, flower01, flower02], {
    transformOrigin: "50% 50%",
  })

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top 64px",
      end: "+=120%",
      scrub: 0.85,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false,
    },
  })

  timeline
    .set(copy, { y: 16 }, 0)
    .set(product, { y: 22, scale: 0.97 }, 0)
    .set(leafLeft, { x: -40, y: 8, rotation: -3, opacity: 0.28 }, 0)
    .set(leafRight, { x: 32, y: 12, rotation: 2.5, opacity: 0.22 }, 0)
    .set(flower02, { y: 18, scale: 0.94, opacity: 0.16 }, 0)
    .set(flower01, { y: 14, scale: 0.96, opacity: 0.12 }, 0)
    .fromTo(background, { y: 8 }, { y: -10, duration: 1 }, 0)
    .to(copy, { y: 0, duration: 0.25 }, 0)
    .to(product, { y: 8, scale: 1, duration: 0.25 }, 0)
    .to(product, { y: 0, duration: 0.3 }, 0.25)
    .to(
      leafLeft,
      { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.3 },
      0.25
    )
    .to(
      leafRight,
      { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.32 },
      0.28
    )
    .to(flower02, { y: 4, scale: 1.02, opacity: 1, duration: 0.25 }, 0.55)
    .to(flower01, { y: 2, scale: 1.015, opacity: 1, duration: 0.22 }, 0.6)
    .to(flower02, { y: 0, scale: 1, duration: 0.2 }, 0.8)
    .to(flower01, { y: 0, scale: 1, duration: 0.2 }, 0.8)

  return timeline
}

function buildCompactTimeline(targets: SceneTargets) {
  const { section, background, copy, product, leafLeft, leafRight, flower01, flower02 } =
    targets

  gsap.set([product, leafLeft, leafRight, flower01, flower02], {
    transformOrigin: "50% 50%",
  })

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
      end: "bottom 50%",
      scrub: 0.45,
      pin: false,
      invalidateOnRefresh: true,
      markers: false,
    },
  })

  timeline
    .set(copy, { y: 8 }, 0)
    .set(product, { y: 10, scale: 0.985 }, 0)
    .set(leafLeft, { x: -14, opacity: 0.6 }, 0)
    .set(leafRight, { x: 12, opacity: 0.55 }, 0)
    .set(flower02, { y: 8, scale: 0.98, opacity: 0.62 }, 0)
    .set(flower01, { y: 6, scale: 0.99, opacity: 0.58 }, 0)
    .fromTo(background, { y: 4 }, { y: -4, duration: 1 }, 0)
    .to(copy, { y: 0, duration: 0.3 }, 0)
    .to(product, { y: 0, scale: 1, duration: 0.45 }, 0)
    .to(leafLeft, { x: 0, opacity: 1, duration: 0.5 }, 0.15)
    .to(leafRight, { x: 0, opacity: 1, duration: 0.55 }, 0.2)
    .to(flower02, { y: 0, scale: 1, opacity: 1, duration: 0.4 }, 0.35)
    .to(flower01, { y: 0, scale: 1, opacity: 1, duration: 0.4 }, 0.4)

  return timeline
}

export default HeroScene
