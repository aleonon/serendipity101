"use client"

import { gsap, useGSAP } from "@lib/animation/gsap"
import { FULL_MOTION_QUERY } from "@lib/animation/reduced-motion"
import CtaLink from "@modules/common/components/cta-link"
import { clx } from "@modules/common/components/ui"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import SceneRoot from "@modules/design-system/components/scene-root"
import Image from "next/image"
import { forwardRef, useRef, useState } from "react"
import {
  FLOWER_SRC,
  FRUIT_SRC,
  LEAF_SRC,
  PLATE_HEIGHT,
  PLATE_WIDTH,
  STORY_STAGES,
} from "./stages"
import StoryStill, { CupMark } from "./story-still"

const DESKTOP_SCENE = `${FULL_MOTION_QUERY} and (min-width: 1024px)`
const COMPACT_SCENE = `${FULL_MOTION_QUERY} and (max-width: 1023px)`

type BotanicalStorySceneProps = {
  exploreHref: string
}

/**
 * One scrubbed timeline on desktop. Narrow viewports and reduced motion
 * keep a vertical reading of the same five stages, without a second pin.
 */
const BotanicalStoryScene = ({ exploreHref }: BotanicalStorySceneProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const contourRef = useRef<SVGSVGElement>(null)
  const leafRef = useRef<HTMLDivElement>(null)
  const flowerRef = useRef<HTMLDivElement>(null)
  const fruitRef = useRef<HTMLDivElement>(null)
  const cupRef = useRef<HTMLDivElement>(null)
  const warmRef = useRef<HTMLDivElement>(null)
  const copyRefs = useRef<Array<HTMLElement | null>>([])
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  useGSAP(
    () => {
      const section = sectionRef.current
      const copies = copyRefs.current.filter(
        (copy): copy is HTMLElement => copy !== null
      )

      if (!section || copies.length !== STORY_STAGES.length) {
        return
      }

      const motion = gsap.matchMedia()

      motion.add(DESKTOP_SCENE, () => {
        setPinned(true)

        const leaf = leafRef.current
        const flower = flowerRef.current
        const fruit = fruitRef.current
        const cup = cupRef.current
        const warm = warmRef.current
        const contour = contourRef.current
        const strokes = contour
          ? Array.from(contour.querySelectorAll("ellipse, path"))
          : []

        if (!leaf || !flower || !fruit || !cup || !warm) {
          return
        }

        const plates = [leaf, flower, fruit, cup]
        gsap.set(plates, { transformOrigin: "50% 60%" })
        strokes.forEach((stroke) => {
          if (!(stroke instanceof SVGGeometryElement)) {
            return
          }

          const length = stroke.getTotalLength()

          if (length > 0) {
            gsap.set(stroke, {
              strokeDasharray: length,
              strokeDashoffset: length * 0.35,
            })
          }
        })

        gsap.set(contour, { opacity: 1 })
        gsap.set(leaf, { y: 24, scale: 0.62, opacity: 0.72 })
        gsap.set(flower, { y: 16, scale: 0.9, opacity: 0 })
        gsap.set(fruit, { y: 16, scale: 0.9, opacity: 0 })
        gsap.set(cup, { y: 12, opacity: 0 })
        gsap.set(warm, { opacity: 0 })
        gsap.set(copies, { opacity: 0, y: 16 })
        gsap.set(copies[0], { opacity: 1, y: 0 })

        const playhead = { step: 0 }
        let shown = 0

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top 64px",
            end: "+=320%",
            pin: true,
            scrub: 0.45,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            markers: false,
          },
        })

        timeline
          .to(strokes, { strokeDashoffset: 0, duration: 0.2 }, 0)
          .to(leaf, { y: 12, duration: 0.2 }, 0)
          .to(copies[0], { opacity: 0, y: -12, duration: 0.06 }, 0.16)
          .to(copies[1], { opacity: 1, y: 0, duration: 0.08 }, 0.18)
          .to(contour, { opacity: 0.15, duration: 0.12 }, 0.18)
          .to(leaf, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.18 }, 0.18)
          .to(copies[1], { opacity: 0, y: -12, duration: 0.06 }, 0.36)
          .to(copies[2], { opacity: 1, y: 0, duration: 0.08 }, 0.38)
          .to(leaf, { x: -28, scale: 0.72, opacity: 0.55, duration: 0.16 }, 0.38)
          .to(flower, { y: 0, scale: 1, opacity: 1, duration: 0.16 }, 0.4)
          .to(copies[2], { opacity: 0, y: -12, duration: 0.06 }, 0.56)
          .to(copies[3], { opacity: 1, y: 0, duration: 0.08 }, 0.58)
          .to(warm, { opacity: 0.55, duration: 0.14 }, 0.58)
          .to(flower, { x: -18, scale: 0.7, opacity: 0.7, duration: 0.16 }, 0.58)
          .to(fruit, { y: 0, scale: 1, opacity: 1, duration: 0.16 }, 0.6)
          .to(copies[3], { opacity: 0, y: -12, duration: 0.06 }, 0.76)
          .to(copies[4], { opacity: 1, y: 0, duration: 0.08 }, 0.78)
          .to(warm, { opacity: 0.22, duration: 0.16 }, 0.78)
          .to(contour, { opacity: 0, duration: 0.1 }, 0.78)
          .to(
            leaf,
            { x: -120, y: 36, scale: 0.38, opacity: 1, duration: 0.18 },
            0.78
          )
          .to(
            flower,
            { x: -8, y: -90, scale: 0.36, opacity: 1, duration: 0.18 },
            0.8
          )
          .to(
            fruit,
            { x: 100, y: 48, scale: 0.4, opacity: 1, duration: 0.18 },
            0.8
          )
          .to(cup, { y: 0, opacity: 1, duration: 0.16 }, 0.84)
          .to(
            playhead,
            {
              step: 1,
              duration: 1,
              ease: "none",
              onUpdate: () => {
                const next = Math.min(4, Math.floor(playhead.step * 5))

                if (next !== shown) {
                  shown = next
                  setActive(next)
                }
              },
            },
            0
          )

        return () => {
          setPinned(false)
          setActive(0)
        }
      })

      motion.add(COMPACT_SCENE, () => {
        copies.forEach((copy) => {
          gsap.from(copy, {
            y: 18,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: copy,
              start: "top 90%",
              once: true,
              markers: false,
            },
          })
        })
      })

      return () => motion.revert()
    },
    { scope: sectionRef }
  )

  return (
    <SceneRoot
      ref={sectionRef}
      scene="botanical-story"
      aria-labelledby="botanical-story-title"
      className="relative overflow-hidden border-b border-serendipity-border bg-serendipity-surface small:motion-safe:h-[calc(100svh-4rem)]"
    >
      <h2 id="botanical-story-title" className="sr-only">
        Del origen a la infusión
      </h2>

      <div className="content-container relative small:motion-safe:grid small:motion-safe:h-full small:motion-safe:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1.05fr)] small:motion-safe:items-center small:motion-safe:gap-6">
        <ol
          aria-label="Progreso del relato"
          className="relative z-20 hidden flex-col gap-4 small:motion-safe:flex"
        >
          {STORY_STAGES.map((stage, index) => (
            <li
              key={stage.id}
              aria-current={index === active ? "step" : undefined}
              className={clx(
                "flex items-baseline gap-3 border-l-2 py-1 pl-3 text-xsmall-regular tabular-nums",
                index === active
                  ? "border-serendipity-accent text-serendipity-primary"
                  : "border-serendipity-border text-serendipity-muted"
              )}
            >
              <span className="font-display text-lg">{stage.index}</span>
              <span>{stage.label}</span>
            </li>
          ))}
        </ol>

        <div className="relative min-w-0 small:motion-safe:h-full">
          {STORY_STAGES.map((stage, index) => (
            <article
              key={stage.id}
              ref={(node) => {
                copyRefs.current[index] = node
              }}
              aria-hidden={pinned && index !== active ? true : undefined}
              inert={pinned && index !== active ? true : undefined}
              className={clx(
                "flex flex-col gap-8 border-t border-serendipity-border-strong py-16 first:border-t-0 small:motion-safe:border-t-0",
                "small:motion-safe:absolute small:motion-safe:inset-0 small:motion-safe:z-10 small:motion-safe:justify-center small:motion-safe:border-0 small:motion-safe:py-0",
                index > 0 && "small:motion-safe:opacity-0"
              )}
            >
              <div className="small:motion-safe:hidden">
                <StoryStill stage={stage.id} />
              </div>
              <div className="max-w-xl">
                <p className="flex items-baseline gap-3 text-serendipity-muted">
                  <span className="font-display text-3xl leading-none text-serendipity-primary">
                    {stage.index}
                  </span>
                  <span className="type-eyebrow">{stage.label}</span>
                </p>
                <EditorialHeading as="h3" className="mt-4">
                  {stage.title}
                </EditorialHeading>
                <p className="text-base-regular mt-4 max-w-md leading-7 text-serendipity-muted">
                  {stage.body}
                </p>
                {stage.id === "infusion" ? (
                  <CtaLink
                    href={exploreHref}
                    className="mt-8"
                    data-testid="botanical-story-cta"
                  >
                    Explorar infusiones
                  </CtaLink>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="relative hidden h-full min-h-0 small:motion-safe:block"
        >
          <div
            ref={warmRef}
            className="absolute inset-[18%] rounded-full bg-serendipity-accent/15"
          />
          <svg
            ref={contourRef}
            viewBox="0 0 400 220"
            fill="none"
            className="absolute inset-[8%] h-auto w-[84%] text-serendipity-sage"
          >
            <ellipse cx="200" cy="120" rx="64" ry="22" stroke="currentColor" strokeWidth="1.25" />
            <ellipse cx="200" cy="120" rx="112" ry="40" stroke="currentColor" strokeWidth="1.25" />
            <ellipse cx="200" cy="120" rx="164" ry="58" stroke="currentColor" strokeWidth="1.25" />
            <path
              d="M24 168c70-28 130-24 352 8"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          <Plate ref={leafRef} src={LEAF_SRC} focus="86% 58%" />
          <Plate ref={flowerRef} src={FLOWER_SRC} focus="16% 62%" />
          <Plate ref={fruitRef} src={FRUIT_SRC} focus="78% 42%" />
          <div ref={cupRef} className="absolute inset-0 flex items-end justify-center pb-[14%]">
            <CupMark className="h-24 w-32 text-serendipity-primary" />
          </div>
        </div>
      </div>
    </SceneRoot>
  )
}

const Plate = forwardRef<HTMLDivElement, { src: string; focus: string }>(
  function Plate({ src, focus }, ref) {
    return (
      <div ref={ref} className="absolute inset-[8%] overflow-hidden">
        <Image
          src={src}
          alt=""
          width={PLATE_WIDTH}
          height={PLATE_HEIGHT}
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="h-full w-full object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
    )
  }
)

export default BotanicalStoryScene
