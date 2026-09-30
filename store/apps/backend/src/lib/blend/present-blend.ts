import {
  BLEND_VERSION,
  isPresentationGrams,
  type BlendCategory,
  type PresentationGrams,
} from "./catalog"
import { sharesAreValid, type BlendSnapshot } from "./validate-blend"

export type BlendCartView = {
  name: string
  gramsLabel: string
  baseLine: string
  ingredientLines: { id: string; label: string }[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isCategory = (value: unknown): value is BlendCategory =>
  value === "leaf" || value === "flower" || value === "fruit"

const percentageOf = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100
    ? value
    : null

/**
 * Reads a version-1 snapshot stored on a line item. Client-shaped objects
 * that skip required fields return null.
 */
export const readBlendSnapshot = (metadata: unknown): BlendSnapshot | null => {
  if (!isRecord(metadata) || metadata.blend_version !== BLEND_VERSION) {
    return null
  }

  if (typeof metadata.blend_name !== "string" || !metadata.blend_name.trim()) {
    return null
  }

  if (!isPresentationGrams(metadata.total_grams)) {
    return null
  }

  const base = isRecord(metadata.base) ? metadata.base : null
  const basePercentage = base ? percentageOf(base.percentage) : null

  if (!base || typeof base.id !== "string" || typeof base.name !== "string" || basePercentage === null) {
    return null
  }

  if (!Array.isArray(metadata.ingredients) || metadata.ingredients.length === 0) {
    return null
  }

  const ingredients: BlendSnapshot["ingredients"] = []

  for (const ingredient of metadata.ingredients) {
    if (!isRecord(ingredient) || !isCategory(ingredient.category)) {
      return null
    }

    const percentage = percentageOf(ingredient.percentage)

    if (
      typeof ingredient.id !== "string" ||
      typeof ingredient.name !== "string" ||
      percentage === null
    ) {
      return null
    }

    ingredients.push({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      percentage,
    })
  }

  const totalGrams: PresentationGrams = metadata.total_grams
  const shares = [basePercentage, ...ingredients.map((ingredient) => ingredient.percentage)]

  if (!sharesAreValid(shares)) {
    return null
  }

  return {
    blend_version: BLEND_VERSION,
    blend_name: metadata.blend_name,
    base: {
      id: base.id,
      name: base.name,
      percentage: basePercentage,
    },
    ingredients,
    total_grams: totalGrams,
  }
}

/**
 * Cart copy for a version-1 snapshot. Returns null when the metadata is not
 * a blend, so the line falls back to the product title. Never returns JSON.
 */
export const presentBlend = (metadata: unknown): BlendCartView | null => {
  const snapshot = readBlendSnapshot(metadata)

  if (!snapshot) {
    return null
  }

  return {
    name: snapshot.blend_name,
    gramsLabel: `${snapshot.total_grams} g`,
    baseLine: `${snapshot.base.name} ${snapshot.base.percentage}%`,
    ingredientLines: snapshot.ingredients.map((ingredient) => ({
      id: ingredient.id,
      label: `${ingredient.name} ${ingredient.percentage}%`,
    })),
  }
}
