export type BlendCategory = "leaf" | "flower" | "fruit"

export type BlendCatalogBase = {
  id: string
  name: string
  description: string
  visual_key: string
}

export type BlendCatalogIngredient = {
  id: string
  name: string
  description: string
  category: BlendCategory
  image: string | null
  visual_key: string
}

export type BlendCatalogPresentation = {
  variant_id: string
  title: string
  grams: number
  amount: number | null
  currency_code: string
}

export type BlendCatalog = {
  blend_version: number
  available: boolean
  product: { id: string; handle: string; title: string } | null
  bases: BlendCatalogBase[]
  ingredients: BlendCatalogIngredient[]
  presentations: BlendCatalogPresentation[]
}

export const EMPTY_BLEND_CATALOG: BlendCatalog = {
  blend_version: 1,
  available: false,
  product: null,
  bases: [],
  ingredients: [],
  presentations: [],
}
