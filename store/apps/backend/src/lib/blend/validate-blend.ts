import {
  BLEND_VERSION,
  DEFAULT_BLEND_NAME,
  MAX_BLEND_NAME_LENGTH,
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
  type BlendCategory,
  type PresentationGrams,
  isPresentationGrams,
} from "./catalog"

/**
 * Composition rule (MVP):
 * The blend is 100 integer shares. The base is the first share and each
 * selected ingredient follows in the order the customer chose. Every part
 * receives `floor(100 / parts)`. The earliest parts receive one extra unit
 * until the remainder is gone, so the sum is exactly 100.
 * Customers do not type percentages. Client-sent names, percentages, and
 * grams are ignored. The server resolves names from the catalog and grams
 * from the Medusa variant.
 *
 * Price (MVP): the line uses the presentation variant's price. This module
 * never sets `unit_price`. A later pricing step can set that price from
 * ingredient weight inside the blend route without creating new variants.
 */

export type CatalogBase = {
  id: string
  name: string
}

export type CatalogIngredient = {
  id: string
  name: string
  category: BlendCategory
}

export type CatalogVariant = {
  id: string
  title: string
  grams: number
}

export type ResolvedCatalog = {
  bases: CatalogBase[]
  ingredients: CatalogIngredient[]
  variants: CatalogVariant[]
}

export type BlendIngredientSnapshot = {
  id: string
  name: string
  category: BlendCategory
  percentage: number
}

export type BlendSnapshot = {
  blend_version: typeof BLEND_VERSION
  blend_name: string
  base: {
    id: string
    name: string
    percentage: number
  }
  ingredients: BlendIngredientSnapshot[]
  total_grams: PresentationGrams
}

export type CartLineInput = {
  variant_id: string
  quantity: 1
  metadata: BlendSnapshot
}

export class BlendValidationError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(issues[0] ?? "La mezcla no es válida.")
    this.name = "BlendValidationError"
    this.issues = issues
  }
}

const NAME_CHARACTERS = /[^\p{L}\p{N}\s'&-]/gu

export const sanitizeBlendName = (value: unknown): string => {
  if (typeof value !== "string") {
    return DEFAULT_BLEND_NAME
  }

  const cleaned = value
    .replace(NAME_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_BLEND_NAME_LENGTH)
    .trim()

  return cleaned.length > 0 ? cleaned : DEFAULT_BLEND_NAME
}

export const allocateIntegerShares = (count: number, total: number): number[] => {
  if (!Number.isInteger(count) || count < 1) {
    throw new BlendValidationError(["La mezcla no tiene partes que repartir."])
  }

  if (!Number.isInteger(total) || total < count) {
    throw new BlendValidationError(["No se pueden repartir las proporciones."])
  }

  const portion = Math.floor(total / count)
  let remainder = total - portion * count

  return Array.from({ length: count }, () => {
    const share = portion + (remainder > 0 ? 1 : 0)
    remainder -= remainder > 0 ? 1 : 0
    return share
  })
}

/** Rejects negatives, NaN, non-integers, values above the total, and a bad sum. */
export const sharesAreValid = (shares: number[], total = 100): boolean => {
  if (!shares.length) {
    return false
  }

  let sum = 0

  for (const share of shares) {
    if (!Number.isInteger(share) || share < 1 || share > total) {
      return false
    }

    sum += share
  }

  return sum === total
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const stringIds = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null
  }

  const ids: string[] = []

  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim() !== entry || entry.length === 0) {
      return null
    }

    ids.push(entry)
  }

  return ids
}

export const composeBlend = (
  input: unknown,
  catalog: ResolvedCatalog
): BlendSnapshot => {
  const issues: string[] = []
  const body = isRecord(input) ? input : {}
  const baseId = typeof body.base_id === "string" ? body.base_id : ""
  const base = catalog.bases.find((item) => item.id === baseId && item.name.trim())
  const ingredientIds = stringIds(body.ingredient_ids)
  const variantId = typeof body.variant_id === "string" ? body.variant_id : ""
  const variant = catalog.variants.find((item) => item.id === variantId)

  if (!base) {
    issues.push("Elige una base permitida.")
  }

  if (!ingredientIds) {
    issues.push("Los ingredientes no tienen un formato válido.")
  } else if (ingredientIds.length < MIN_INGREDIENTS) {
    issues.push("Elige al menos un ingrediente.")
  } else if (ingredientIds.length > MAX_INGREDIENTS) {
    issues.push("Puedes elegir hasta 6 ingredientes.")
  } else if (new Set(ingredientIds).size !== ingredientIds.length) {
    issues.push("Hay un ingrediente repetido.")
  }

  const resolvedIngredients: CatalogIngredient[] = []

  if (ingredientIds && new Set(ingredientIds).size === ingredientIds.length) {
    for (const id of ingredientIds) {
      const ingredient = catalog.ingredients.find(
        (item) => item.id === id && item.name.trim()
      )

      if (!ingredient) {
        issues.push("Hay un ingrediente que no existe en el catálogo.")
        break
      }

      if (catalog.bases.some((item) => item.id === id)) {
        issues.push("Una base no puede usarse como ingrediente.")
        break
      }

      resolvedIngredients.push(ingredient)
    }
  }

  if (!variant || !isPresentationGrams(variant.grams)) {
    issues.push("Esa presentación no existe.")
  }

  if (issues.length || !base || !variant || !isPresentationGrams(variant.grams)) {
    throw new BlendValidationError(
      issues.length ? issues : ["La mezcla no es válida."]
    )
  }

  const shares = allocateIntegerShares(1 + resolvedIngredients.length, 100)

  if (!sharesAreValid(shares)) {
    throw new BlendValidationError(["Las proporciones de la mezcla no son válidas."])
  }

  const [baseShare, ...ingredientShares] = shares

  if (baseShare === undefined || ingredientShares.length !== resolvedIngredients.length) {
    throw new BlendValidationError(["Las proporciones de la mezcla no son válidas."])
  }

  return {
    blend_version: BLEND_VERSION,
    blend_name: sanitizeBlendName(body.blend_name),
    base: {
      id: base.id,
      name: base.name,
      percentage: baseShare,
    },
    ingredients: resolvedIngredients.map((ingredient, index) => {
      const percentage = ingredientShares[index]

      if (percentage === undefined) {
        throw new BlendValidationError(["Las proporciones de la mezcla no son válidas."])
      }

      return {
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        percentage,
      }
    }),
    total_grams: variant.grams,
  }
}

/**
 * Payload for Medusa's add-to-cart workflow. `unit_price` is omitted on
 * purpose: the presentation variant remains the price.
 */
export const toCartLine = (
  snapshot: BlendSnapshot,
  variantId: string
): CartLineInput => ({
  variant_id: variantId,
  quantity: 1,
  metadata: snapshot,
})

export const blendLineKey = (
  snapshot: BlendSnapshot,
  variantId: string
): string =>
  [
    snapshot.blend_version,
    variantId,
    snapshot.total_grams,
    snapshot.blend_name,
    snapshot.base.id,
    snapshot.base.percentage,
    ...snapshot.ingredients.flatMap((ingredient) => [
      ingredient.id,
      ingredient.category,
      ingredient.percentage,
    ]),
  ].join("|")
