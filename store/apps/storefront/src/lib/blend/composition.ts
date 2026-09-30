/**
 * Same integer split as the backend validator: the base is the first part,
 * then ingredients in selection order. Earliest parts absorb the remainder
 * so the shares add up to 100. The cart stores the server result.
 */
export const DEFAULT_BLEND_NAME = "Mi Serendipity"
const MAX_BLEND_NAME_LENGTH = 40
const NAME_CHARACTERS = /[^\p{L}\p{N}\s'&-]/gu

export const sanitizeBlendName = (value: string): string => {
  const cleaned = value
    .replace(NAME_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_BLEND_NAME_LENGTH)
    .trim()

  return cleaned.length > 0 ? cleaned : DEFAULT_BLEND_NAME
}

export const allocateIntegerShares = (
  count: number,
  total: number
): number[] | null => {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    !Number.isInteger(total) ||
    total < count
  ) {
    return null
  }

  const portion = Math.floor(total / count)
  let remainder = total - portion * count

  return Array.from({ length: count }, () => {
    const share = portion + (remainder > 0 ? 1 : 0)
    remainder -= remainder > 0 ? 1 : 0
    return share
  })
}

export const previewComposition = (
  ingredientCount: number
): { base: number; ingredients: number[] } | null => {
  const shares = allocateIntegerShares(1 + ingredientCount, 100)

  if (!shares || ingredientCount < 1) {
    return null
  }

  const [base, ...ingredients] = shares

  if (base === undefined || ingredients.length !== ingredientCount) {
    return null
  }

  return { base, ingredients }
}
