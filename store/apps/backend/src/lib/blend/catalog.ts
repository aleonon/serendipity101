/**
 * Version 1 ingredient registry for the custom blend.
 *
 * Sellable stock is the single product `mezcla-personalizada`. These rows are
 * not variants and not a combination matrix. Ingredient ids are handles of
 * products that already exist in the Infusiones catalog. Names shown to the
 * customer are resolved from those products at request time.
 *
 * Bases are not separate SKUs. The live catalog has no black, green, or
 * oolong tea. The three bases below reuse style names already used as
 * subtitles on real products (herbal, floral, citrus). Replacing this file
 * with a Medusa module later should keep the same ids.
 */
export const BLEND_VERSION = 1 as const

export const BLEND_PRODUCT_HANDLE = "mezcla-personalizada"

export const DEFAULT_BLEND_NAME = "Mi Serendipity"

export const MAX_INGREDIENTS = 6

export const MIN_INGREDIENTS = 1

export const MAX_BLEND_NAME_LENGTH = 40

export const PRESENTATION_GRAMS = [50, 100, 200] as const

export type PresentationGrams = (typeof PRESENTATION_GRAMS)[number]

export type BlendCategory = "leaf" | "flower" | "fruit"

export type BlendBaseDefinition = {
  id: string
  name: string
  description: string
  visual_key: string
}

export type BlendIngredientRole = {
  /** Stable id. Matches an existing product handle. */
  id: string
  category: BlendCategory
  visual_key: string
  /** Public fallback when the product has no thumbnail yet. */
  image: string
}

export const BASES: readonly BlendBaseDefinition[] = [
  {
    id: "base-herbal",
    name: "Infusión herbal",
    description: "Hoja suave, la misma familia herbal del catálogo.",
    visual_key: "leaf",
  },
  {
    id: "base-floral",
    name: "Infusión floral",
    description: "Una base de flor, como las infusiones florales de la tienda.",
    visual_key: "flower",
  },
  {
    id: "base-citrus",
    name: "Infusión cítrica",
    description: "Base cítrica, en la línea de la hierba luisa.",
    visual_key: "citrus",
  },
]

const catalogImage = (file: string) => `/serendipity/Cat%C3%A1logo/${file}`

export const INGREDIENT_ROLES: readonly BlendIngredientRole[] = [
  {
    id: "menta",
    category: "leaf",
    visual_key: "leaf",
    image: catalogImage("2.png"),
  },
  {
    id: "hierba-luisa",
    category: "leaf",
    visual_key: "leaf",
    image: catalogImage("5.png"),
  },
  {
    id: "flores-andinas",
    category: "leaf",
    visual_key: "leaf",
    image: catalogImage("7.png"),
  },
  {
    id: "flor-de-jamaica",
    category: "flower",
    visual_key: "flower",
    image: catalogImage("1.png"),
  },
  {
    id: "manzanilla",
    category: "flower",
    visual_key: "flower",
    image: catalogImage("3.png"),
  },
  {
    id: "lavanda",
    category: "flower",
    visual_key: "flower",
    image: catalogImage("4.png"),
  },
  {
    id: "rosa-frambuesa",
    category: "fruit",
    visual_key: "fruit",
    image: catalogImage("6.png"),
  },
]

export const isPresentationGrams = (
  value: unknown
): value is PresentationGrams =>
  value === 50 || value === 100 || value === 200

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/**
 * Grams come from the variant stored in Medusa. A title and metadata that
 * disagree are rejected so a tampered label cannot change the size.
 */
export const gramsFromVariant = (variant: {
  title?: string | null
  metadata?: unknown
}): PresentationGrams | null => {
  const metadata = isRecord(variant.metadata) ? variant.metadata.grams : undefined
  const metadataGrams = isPresentationGrams(metadata) ? metadata : null
  const title = typeof variant.title === "string" ? variant.title.trim() : ""
  const match = /^(\d+) g$/.exec(title)
  const titleGrams = match ? Number(match[1]) : null
  const parsedTitle = isPresentationGrams(titleGrams) ? titleGrams : null

  if (metadataGrams !== null && parsedTitle !== null && metadataGrams !== parsedTitle) {
    return null
  }

  return metadataGrams ?? parsedTitle
}
