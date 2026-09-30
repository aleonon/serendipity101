import type {
  BlendCatalogBase,
  BlendCatalogIngredient,
} from "@lib/blend/types"
import Image from "next/image"

const PLATES: Record<string, { src: string; position: string }> = {
  leaf: { src: "/serendipity/hero/leaf.svg", position: "86% 58%" },
  flower: { src: "/serendipity/hero/flower_02.png", position: "16% 62%" },
  fruit: { src: "/serendipity/hero/fruit.png", position: "78% 42%" },
  citrus: { src: "/serendipity/Cat%C3%A1logo/5.png", position: "center 40%" },
}

const SPOTS = [
  "left-[8%] top-[12%] h-[40%] w-[46%]",
  "right-[6%] top-[18%] h-[36%] w-[40%]",
  "left-[24%] bottom-[8%] h-[38%] w-[42%]",
  "right-[12%] bottom-[14%] h-[32%] w-[34%]",
  "left-[16%] top-[38%] h-[28%] w-[30%]",
  "right-[18%] top-[40%] h-[26%] w-[28%]",
]

type BlendPreviewProps = {
  base: BlendCatalogBase | null
  ingredients: BlendCatalogIngredient[]
}

const BlendPreview = ({ base, ingredients }: BlendPreviewProps) => {
  const plate = base ? PLATES[base.visual_key] : PLATES.leaf
  const summary = [
    base?.name,
    ...ingredients.map((ingredient) => ingredient.name),
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <figure className="m-0">
      <div className="relative aspect-[5/3] max-h-64 overflow-hidden rounded-large bg-serendipity-sage-soft small:aspect-[4/5] small:max-h-none">
        {plate ? (
          <Image
            src={plate.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 22rem, 100vw"
            className="object-cover"
            style={{ objectPosition: plate.position }}
          />
        ) : null}
        <div className="absolute inset-0 bg-serendipity-bg/25" />
        {ingredients.map((ingredient, index) => {
          const spot = SPOTS[index]
          if (!spot || !ingredient.image) {
            return null
          }

          return (
            <div
              key={ingredient.id}
              className={`absolute overflow-hidden rounded-full border border-serendipity-surface shadow-sm ${spot}`}
            >
              <Image
                src={ingredient.image}
                alt=""
                fill
                sizes="8rem"
                className="object-cover"
              />
            </div>
          )
        })}
      </div>
      <figcaption className="sr-only" aria-live="polite">
        {summary
          ? `Mezcla: ${summary}`
          : "La mezcla todavía no tiene ingredientes."}
      </figcaption>
    </figure>
  )
}

export default BlendPreview
