import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import {
  FLOWER_SRC,
  FRUIT_SRC,
  LEAF_SRC,
  PLATE_HEIGHT,
  PLATE_WIDTH,
  type StoryStageId,
} from "./stages"

type StoryStillProps = {
  stage: StoryStageId
}

/**
 * One still per stage for the vertical reading (mobile and reduced motion).
 * Desktop motion uses a separate shared stage so the plates can gather.
 */
const StoryStill = ({ stage }: StoryStillProps) => {
  if (stage === "origin") {
    return (
      <div className="relative">
        <OriginContours className="mx-auto h-36 w-full max-w-sm text-serendipity-sage" />
        <CroppedPlate
          src={LEAF_SRC}
          alt="Hoja todavía pequeña, al inicio del relato."
          focus="86% 58%"
          className="mx-auto -mt-10 aspect-[4/3] w-[70%] opacity-80"
        />
      </div>
    )
  }

  if (stage === "leaf") {
    return (
      <CroppedPlate
        src={LEAF_SRC}
        alt="Ilustración de una hoja."
        focus="86% 58%"
      />
    )
  }

  if (stage === "flower") {
    return (
      <CroppedPlate
        src={FLOWER_SRC}
        alt="Ilustración de una flor."
        focus="16% 62%"
      />
    )
  }

  if (stage === "fruit") {
    return (
      <CroppedPlate
        src={FRUIT_SRC}
        alt="Ilustración de un fruto con hojas."
        focus="78% 42%"
      />
    )
  }

  return (
    <div className="relative mx-auto h-72 w-full max-w-md">
      <CroppedPlate
        src={LEAF_SRC}
        alt=""
        focus="86% 58%"
        className="absolute left-0 top-6 aspect-square w-[58%]"
      />
      <CroppedPlate
        src={FLOWER_SRC}
        alt=""
        focus="16% 62%"
        className="absolute right-0 top-0 aspect-square w-[58%]"
      />
      <CroppedPlate
        src={FRUIT_SRC}
        alt="Hoja, flor y fruto reunidos en la infusión."
        focus="78% 42%"
        className="absolute bottom-0 left-[22%] aspect-square w-[56%]"
      />
      <CupMark className="absolute bottom-1 right-4 h-16 w-20 text-serendipity-primary" />
    </div>
  )
}

function CroppedPlate({
  src,
  alt,
  focus,
  className,
}: {
  src: string
  alt: string
  focus: string
  className?: string
}) {
  return (
    <div className={clx("relative aspect-[4/3] overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={PLATE_WIDTH}
        height={PLATE_HEIGHT}
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="h-full w-full object-cover"
        style={{ objectPosition: focus }}
      />
    </div>
  )
}

export function OriginContours({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 220"
      fill="none"
      className={className}
    >
      <ellipse cx="200" cy="120" rx="64" ry="22" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="200" cy="120" rx="112" ry="40" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="200" cy="120" rx="164" ry="58" stroke="currentColor" strokeWidth="1" />
      <path
        d="M24 168c70-28 130-24 352 8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CupMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clx(className)}
    >
      <path d="M20 28h68v24a16 16 0 0 1-16 16H36a16 16 0 0 1-16-16V28Z" />
      <path d="M88 34h8a10 10 0 0 1 0 20h-8" />
      <path d="M40 16c3 6 7 6 10 0" />
      <path d="M58 14c3 6 7 6 10 0" />
    </svg>
  )
}

export default StoryStill
