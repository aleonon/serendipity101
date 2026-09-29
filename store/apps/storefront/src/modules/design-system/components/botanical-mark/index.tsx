import { clx } from "@modules/common/components/ui"

type BotanicalMarkProps = {
  className?: string
}

/**
 * Decorative sprig for editorial composition. It has no animation behavior
 * and is always hidden from assistive technology.
 */
const BotanicalMark = ({ className }: BotanicalMarkProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className={clx("text-serendipity-sage", className)}
    >
      <path d="M32 118V8" />
      <path d="M32 96c-14 0-22-8-22-20 12 0 22 7 22 20Z" />
      <path d="M32 96c14 0 22-8 22-20-12 0-22 7-22 20Z" />
      <path d="M32 66c-12 0-19-7-19-18 10 0 19 6 19 18Z" />
      <path d="M32 66c12 0 19-7 19-18-10 0-19 6-19 18Z" />
      <path d="M32 38c-9 0-15-6-15-14 8 0 15 5 15 14Z" />
      <path d="M32 38c9 0 15-6 15-14-8 0-15 5-15 14Z" />
      <circle cx="32" cy="8" r="4" />
    </svg>
  )
}

export default BotanicalMark
