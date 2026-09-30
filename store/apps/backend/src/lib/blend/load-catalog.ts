import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
import {
  BASES,
  BLEND_PRODUCT_HANDLE,
  BLEND_VERSION,
  INGREDIENT_ROLES,
  gramsFromVariant,
  type BlendCategory,
} from "./catalog"

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
  blend_version: typeof BLEND_VERSION
  available: boolean
  product: { id: string; handle: string; title: string } | null
  bases: BlendCatalogBase[]
  ingredients: BlendCatalogIngredient[]
  presentations: BlendCatalogPresentation[]
}

const emptyCatalog = (): BlendCatalog => ({
  blend_version: BLEND_VERSION,
  available: false,
  product: null,
  bases: [],
  ingredients: [],
  presentations: [],
})

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : ""

type GraphProduct = {
  id?: string
  title?: string | null
  handle?: string | null
  subtitle?: string | null
  thumbnail?: string | null
  variants?: GraphVariant[] | null
}

type GraphVariant = {
  id?: string
  title?: string | null
  metadata?: unknown
  calculated_price?: {
    calculated_amount?: unknown
    currency_code?: string | null
  } | null
}

const amountOf = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

export const loadBlendCatalog = async (
  container: MedusaContainer,
  currencyCode: string
): Promise<BlendCatalog> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const handles = INGREDIENT_ROLES.map((role) => role.id)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "subtitle", "thumbnail"],
    filters: { handle: [...handles, BLEND_PRODUCT_HANDLE] },
  })

  const rows = products as GraphProduct[]
  const blend = rows.find((product) => product.handle === BLEND_PRODUCT_HANDLE)

  if (!blend?.id || !text(blend.title)) {
    return emptyCatalog()
  }

  const ingredients: BlendCatalogIngredient[] = []

  for (const role of INGREDIENT_ROLES) {
    const product = rows.find((item) => item.handle === role.id)
    const name = text(product?.title)

    if (!product?.id || !name) {
      continue
    }

    ingredients.push({
      id: role.id,
      name,
      description: text(product.subtitle),
      category: role.category,
      image: text(product.thumbnail) || role.image,
      visual_key: role.visual_key,
    })
  }

  const { data: priced } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "variants.id",
      "variants.title",
      "variants.metadata",
      "variants.calculated_price.calculated_amount",
      "variants.calculated_price.currency_code",
    ],
    filters: { id: blend.id },
    context: {
      variants: {
        calculated_price: QueryContext({ currency_code: currencyCode }),
      },
    },
  })

  const pricedProduct = (priced[0] ?? null) as GraphProduct | null
  const presentations: BlendCatalogPresentation[] = []

  for (const variant of pricedProduct?.variants ?? []) {
    if (!variant?.id) {
      continue
    }

    const grams = gramsFromVariant(variant)

    if (grams === null) {
      continue
    }

    const amount = amountOf(variant.calculated_price?.calculated_amount)
    const pricedCurrency = text(variant.calculated_price?.currency_code).toLowerCase()

    presentations.push({
      variant_id: variant.id,
      title: `${grams} g`,
      grams,
      amount,
      currency_code: pricedCurrency || currencyCode,
    })
  }

  presentations.sort((a, b) => a.grams - b.grams)

  return {
    blend_version: BLEND_VERSION,
    available: presentations.length > 0 && ingredients.length > 0,
    product: {
      id: blend.id,
      handle: BLEND_PRODUCT_HANDLE,
      title: text(blend.title),
    },
    bases: BASES.map((base) => ({ ...base })),
    ingredients,
    presentations,
  }
}

export const isCurrencyCode = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z]{3}$/.test(value)

export const readCurrencyCode = (value: unknown): string => {
  if (Array.isArray(value)) {
    return readCurrencyCode(value[0])
  }

  return isCurrencyCode(value) ? value : "usd"
}
