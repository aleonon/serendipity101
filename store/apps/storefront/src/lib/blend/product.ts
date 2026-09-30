/** Keep in sync with the backend blend product handle. */
export const BLEND_PRODUCT_HANDLE = "mezcla-personalizada"

export const isCustomBlendProduct = (product: {
  handle?: string | null
  metadata?: Record<string, unknown> | null
}) =>
  product.handle === BLEND_PRODUCT_HANDLE ||
  product.metadata?.blend_product === true
