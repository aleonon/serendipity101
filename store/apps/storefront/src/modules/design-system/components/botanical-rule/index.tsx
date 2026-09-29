import { clx } from "@modules/common/components/ui"

type BotanicalRuleProps = {
  className?: string
}

const BotanicalRule = ({ className }: BotanicalRuleProps) => {
  return (
    <div
      aria-hidden="true"
      className={clx("flex items-center gap-3 text-serendipity-sage", className)}
    >
      <span className="h-px flex-1 bg-current opacity-50" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className="h-5 w-5"
      >
        <path d="M12 21V4" />
        <path d="M12 14c-5 0-8-3-8-7 5 0 8 3 8 7Z" />
        <path d="M12 14c5 0 8-3 8-7-5 0-8 3-8 7Z" />
      </svg>
      <span className="h-px flex-1 bg-current opacity-50" />
    </div>
  )
}

export default BotanicalRule
