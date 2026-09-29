import { clx } from "@modules/common/components/ui"

type BotanicalLeafProps = {
  className?: string
}

/**
 * Small botanical glyph for inline decoration. Hidden from assistive
 * technology and free of animation behavior.
 */
const BotanicalLeaf = ({ className }: BotanicalLeafProps) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className={clx("h-5 w-5 text-serendipity-sage", className)}
    >
      <path d="M12 21c0-9 6-14 10-16-1 8-6 13-10 16Z" />
      <path d="M12 21C12 12 6 7 2 5c1 8 6 13 10 16Z" />
      <path d="M12 21V7" />
    </svg>
  )
}

export default BotanicalLeaf
