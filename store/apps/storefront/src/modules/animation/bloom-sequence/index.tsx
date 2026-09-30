"use client"

import { clx } from "@modules/common/components/ui"
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react"

/** Contiguous export: frame-001.webp … frame-109.webp. Do not invent indexes. */
export const BLOOM_FRAME_COUNT = 109

const BLOOM_DIRECTORY = "/serendipity/animations/bloom"

export const BLOOM_FRAMES: readonly string[] = Array.from(
  { length: BLOOM_FRAME_COUNT },
  (_, index) =>
    `${BLOOM_DIRECTORY}/frame-${String(index + 1).padStart(3, "0")}.webp`
)

/**
 * Full sequence only when motion is allowed and the viewport is wider than
 * a phone. Phones and reduced motion keep a single still.
 */
const SEQUENCE_QUERY =
  "(prefers-reduced-motion: no-preference) and (min-width: 769px)"

const NEARBY_COUNT = 8
const EVICT_RADIUS = 16
const MAX_DEVICE_PIXEL_RATIO = 2

export type BloomSequenceHandle = {
  renderFrame: (index: number) => void
}

type BloomSequenceProps = {
  frames: readonly string[]
  className?: string
}

type Playback = "sequence" | "static"

/**
 * Scroll-scrubbed bloom drawn on one canvas. The parent timeline owns the
 * playhead; this component only loads frames and paints the requested index.
 */
const BloomSequence = forwardRef<BloomSequenceHandle, BloomSequenceProps>(
  function BloomSequence({ frames, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const renderFrameRef = useRef<(index: number) => void>(() => {})

    useImperativeHandle(
      ref,
      () => ({
        renderFrame(index: number) {
          renderFrameRef.current(index)
        },
      }),
      []
    )

    useLayoutEffect(() => {
      const canvas = canvasRef.current
      const stage = canvas?.parentElement

      if (!canvas || !stage || frames.length === 0) {
        return
      }

      const media = window.matchMedia(SEQUENCE_QUERY)
      const context = canvas.getContext("2d", { alpha: true })
      let cancelled = false
      let token = 0
      let playback: Playback = "static"
      let desiredIndex = frames.length - 1
      const images: (HTMLImageElement | null)[] = Array.from(
        { length: frames.length },
        () => null
      )
      const inflight = new Map<number, Promise<HTMLImageElement | null>>()
      let paintedImage: HTMLImageElement | null = null
      let paintedWidth = 0
      let paintedHeight = 0

      const paint = (index: number) => {
        if (!context || cancelled) {
          return
        }

        const image = nearestImage(images, index)

        if (!image) {
          return
        }

        if (
          image === paintedImage &&
          canvas.width === paintedWidth &&
          canvas.height === paintedHeight
        ) {
          return
        }

        drawContain(context, canvas, image)
        paintedImage = image
        paintedWidth = canvas.width
        paintedHeight = canvas.height
      }

      const resize = () => {
        const bounds = stage.getBoundingClientRect()
        resizeCanvas(canvas, bounds.width, bounds.height)
        paint(desiredIndex)
      }

      const load = (index: number, requestToken: number) => {
        if (index < 0 || index >= frames.length) {
          return Promise.resolve(null)
        }

        const cached = images[index]

        if (cached) {
          return Promise.resolve(cached)
        }

        const pending = inflight.get(index)

        if (pending) {
          return pending
        }

        const task = new Promise<HTMLImageElement | null>((resolve) => {
          const image = new Image()
          image.decoding = "async"

          if ("fetchPriority" in image) {
            image.fetchPriority = index === desiredIndex ? "high" : "low"
          }

          image.onload = () => {
            inflight.delete(index)

            if (cancelled || requestToken !== token) {
              releaseImage(image)
              resolve(null)
              return
            }

            if (Math.abs(index - desiredIndex) > EVICT_RADIUS) {
              releaseImage(image)
              resolve(null)
              return
            }

            images[index] = image

            if (index === desiredIndex || !images[desiredIndex]) {
              paint(desiredIndex)
            }

            resolve(image)
          }

          image.onerror = () => {
            inflight.delete(index)
            resolve(null)
          }

          image.src = frames[index]
        })

        inflight.set(index, task)
        return task
      }

      const evictFar = (center: number) => {
        for (let index = 0; index < images.length; index += 1) {
          const image = images[index]

          if (!image || Math.abs(index - center) <= EVICT_RADIUS) {
            continue
          }

          releaseImage(image)
          images[index] = null
        }
      }

      const ensureWindow = (center: number, requestToken: number) => {
        evictFar(center)
        const start = Math.max(0, center - NEARBY_COUNT)
        const end = Math.min(frames.length, center + NEARBY_COUNT + 1)
        void Promise.all(
          range(start, end).map((index) => load(index, requestToken))
        )
      }

      const loadPlayback = async (mode: Playback, requestToken: number) => {
        if (mode === "static") {
          const still = frames.length - 1
          const finalFrame = await load(still, requestToken)

          if (cancelled || requestToken !== token || playback !== "static") {
            return
          }

          if (!finalFrame) {
            await load(0, requestToken)
          }

          return
        }

        await load(0, requestToken)

        if (cancelled || requestToken !== token || playback !== "sequence") {
          return
        }

        ensureWindow(0, requestToken)
      }

      const start = () => {
        token += 1
        const requestToken = token
        playback = media.matches ? "sequence" : "static"
        desiredIndex = playback === "sequence" ? 0 : frames.length - 1
        releaseAll(images)
        inflight.clear()
        paintedImage = null
        resize()
        void loadPlayback(playback, requestToken)
      }

      const onMediaChange = () => {
        start()
      }

      renderFrameRef.current = (index: number) => {
        if (playback !== "sequence" || cancelled) {
          return
        }

        desiredIndex = clamp(index, 0, frames.length - 1)
        paint(desiredIndex)
        ensureWindow(desiredIndex, token)
      }

      const observer = new ResizeObserver(resize)
      observer.observe(stage)
      window.addEventListener("resize", resize)
      media.addEventListener("change", onMediaChange)
      start()

      return () => {
        cancelled = true
        renderFrameRef.current = () => {}
        observer.disconnect()
        window.removeEventListener("resize", resize)
        media.removeEventListener("change", onMediaChange)
        inflight.clear()
        releaseAll(images)

        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }, [frames])

    return (
      <div
        aria-hidden="true"
        className={clx(
          "pointer-events-none absolute inset-0 z-0",
          // Desktop: a portrait plate behind the package, tall enough for the
          // bloom to rise above the box. Stacked layouts stay inside the stage.
          "small:inset-auto small:bottom-0 small:left-1/2 small:w-[62%] small:-translate-x-1/2 small:aspect-[1600/2133]",
          className
        )}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    )
  }
)

function resizeCanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
  const width = Math.max(1, Math.round(cssWidth * dpr))
  const height = Math.max(1, Math.round(cssHeight * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

function drawContain(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
) {
  const width = image.naturalWidth
  const height = image.naturalHeight
  const boundsWidth = canvas.width
  const boundsHeight = canvas.height

  if (!width || !height || !boundsWidth || !boundsHeight) {
    return
  }

  const scale = Math.min(boundsWidth / width, boundsHeight / height)
  const drawWidth = Math.max(1, Math.round(width * scale))
  const drawHeight = Math.max(1, Math.round(height * scale))
  // A landscape stage is the product plate. Sit the bloom on the clear
  // side of that plate instead of directly behind the package.
  const frameAspect = width / height
  const stageIsLandscape = boundsWidth / boundsHeight > frameAspect * 1.2
  const offsetX = stageIsLandscape
    ? boundsWidth - drawWidth
    : Math.round((boundsWidth - drawWidth) / 2)
  const offsetY = stageIsLandscape
    ? 0
    : Math.round((boundsHeight - drawHeight) / 2)

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, boundsWidth, boundsHeight)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

  const plate = context.getImageData(offsetX, offsetY, drawWidth, drawHeight)
  knockOutWhite(plate.data)
  context.putImageData(plate, offsetX, offsetY)
}

/**
 * The export sits on a white plate. Near-white pixels become transparent
 * so the bloom can layer over the cream hero without a card.
 */
function knockOutWhite(pixels: Uint8ClampedArray) {
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const min =
      red < green ? (red < blue ? red : blue) : green < blue ? green : blue

    if (min >= 250) {
      pixels[index + 3] = 0
      continue
    }

    if (min > 228) {
      pixels[index + 3] = Math.round(pixels[index + 3] * ((250 - min) / 22))
    }
  }
}

function nearestImage(images: (HTMLImageElement | null)[], index: number) {
  if (images[index]) {
    return images[index]
  }

  for (let distance = 1; distance < images.length; distance += 1) {
    const previous = images[index - distance]
    const next = images[index + distance]

    if (previous) {
      return previous
    }

    if (next) {
      return next
    }
  }

  return null
}

function releaseImage(image: HTMLImageElement) {
  image.onload = null
  image.onerror = null
  image.src = ""
}

function releaseAll(images: (HTMLImageElement | null)[]) {
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index]

    if (image) {
      releaseImage(image)
      images[index] = null
    }
  }
}

function range(start: number, end: number) {
  const indexes: number[] = []

  for (let index = start; index < end; index += 1) {
    indexes.push(index)
  }

  return indexes
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default BloomSequence
