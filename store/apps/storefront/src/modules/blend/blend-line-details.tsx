import { presentBlend } from "@lib/blend/present"

type BlendLineDetailsProps = {
  metadata: unknown
}

const BlendLineDetails = ({ metadata }: BlendLineDetailsProps) => {
  const blend = presentBlend(metadata)

  if (!blend) {
    return null
  }

  return (
    <div
      className="mt-2 space-y-1 text-small-regular text-serendipity-ink"
      data-testid="blend-recipe"
    >
      <p>{blend.gramsLabel}</p>
      <p>
        <span className="text-serendipity-muted">Base: </span>
        {blend.baseLine}
      </p>
      <p className="text-serendipity-muted">Ingredientes:</p>
      <ul className="space-y-0.5">
        {blend.ingredientLines.map((line) => (
          <li key={line.id}>{line.label}</li>
        ))}
      </ul>
    </div>
  )
}

export default BlendLineDetails
