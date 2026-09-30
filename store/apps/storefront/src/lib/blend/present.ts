export type BlendCartView = {
  name: string
  gramsLabel: string
  baseLine: string
  ingredientLines: { id: string; label: string }[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isCategory = (value: unknown): boolean =>
  value === "leaf" || value === "flower" || value === "fruit"

const percentageOf = (value: unknown): number | null =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 100
    ? value
    : null

/**
 * Cart copy for blend_version 1. Kept aligned with the backend presenter
 * covered by blend.unit.spec.ts. Invalid metadata returns null.
 */
export const presentBlend = (metadata: unknown): BlendCartView | null => {
  if (!isRecord(metadata) || metadata.blend_version !== 1) {
    return null
  }

  if (typeof metadata.blend_name !== "string" || !metadata.blend_name.trim()) {
    return null
  }

  if (
    metadata.total_grams !== 50 &&
    metadata.total_grams !== 100 &&
    metadata.total_grams !== 200
  ) {
    return null
  }

  const base = isRecord(metadata.base) ? metadata.base : null
  const basePercentage = base ? percentageOf(base.percentage) : null

  if (
    !base ||
    typeof base.name !== "string" ||
    typeof base.id !== "string" ||
    basePercentage === null ||
    !Array.isArray(metadata.ingredients) ||
    metadata.ingredients.length === 0
  ) {
    return null
  }

  const ingredientLines: { id: string; label: string }[] = []
  const shares = [basePercentage]

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

    shares.push(percentage)
    ingredientLines.push({
      id: ingredient.id,
      label: `${ingredient.name} ${percentage}%`,
    })
  }

  if (shares.reduce((sum, share) => sum + share, 0) !== 100) {
    return null
  }

  return {
    name: metadata.blend_name,
    gramsLabel: `${metadata.total_grams} g`,
    baseLine: `${base.name} ${basePercentage}%`,
    ingredientLines,
  }
}
