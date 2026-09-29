import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { forwardRef } from "react"

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1076

type HeroBotanicalLayerProps = {
  src: string
  className?: string
}

/**
 * One transparent botanical plate, aligned to the same 1920×1076 stage
 * as the product. The forwarded ref is the GSAP target.
 */
const HeroBotanicalLayer = forwardRef<HTMLDivElement, HeroBotanicalLayerProps>(
  function HeroBotanicalLayer({ src, className }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={clx("pointer-events-none absolute inset-0", className)}
      >
        <Image
          src={src}
          alt=""
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="h-full w-full"
        />
      </div>
    )
  }
)

export default HeroBotanicalLayer
