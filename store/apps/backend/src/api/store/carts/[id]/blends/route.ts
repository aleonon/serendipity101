import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { loadBlendCatalog } from "../../../../../lib/blend/load-catalog"
import { readBlendSnapshot } from "../../../../../lib/blend/present-blend"
import {
  BlendValidationError,
  blendLineKey,
  composeBlend,
  toCartLine,
} from "../../../../../lib/blend/validate-blend"

type CartItemRow = {
  id?: string
  variant_id?: string | null
  metadata?: unknown
}

/**
 * Validates a blend and adds the presentation variant to the existing cart.
 * The recipe is a server-built snapshot. Repeating the same recipe does not
 * create a second line; quantity stays on the line already in the cart.
 * Editing that line is intentionally not supported here.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id

  if (!cartId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No encontramos el carrito."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "currency_code", "items.id", "items.variant_id", "items.metadata"],
    filters: { id: cartId },
  })

  const cart = carts[0] as
    | { id?: string; currency_code?: string | null; items?: CartItemRow[] | null }
    | undefined

  if (!cart?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No encontramos el carrito."
    )
  }

  const currencyCode =
    typeof cart.currency_code === "string" && cart.currency_code
      ? cart.currency_code.toLowerCase()
      : "usd"
  const catalog = await loadBlendCatalog(req.scope, currencyCode)

  if (!catalog.available || !catalog.product) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "La mezcla personalizada no está disponible."
    )
  }

  let snapshot

  try {
    snapshot = composeBlend(req.body, {
      bases: catalog.bases.map((base) => ({ id: base.id, name: base.name })),
      ingredients: catalog.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
      })),
      variants: catalog.presentations.map((presentation) => ({
        id: presentation.variant_id,
        title: presentation.title,
        grams: presentation.grams,
      })),
    })
  } catch (error) {
    if (error instanceof BlendValidationError) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, error.issues.join(" "))
    }

    throw error
  }

  const variantId =
    typeof req.body === "object" &&
    req.body !== null &&
    "variant_id" in req.body &&
    typeof req.body.variant_id === "string"
      ? req.body.variant_id
      : ""
  const line = toCartLine(snapshot, variantId)
  const key = blendLineKey(snapshot, variantId)
  const existing = (cart.items ?? []).find((item) => {
    if (item.variant_id !== variantId) {
      return false
    }

    const stored = readBlendSnapshot(item.metadata)

    return stored !== null && blendLineKey(stored, variantId) === key
  })

  if (existing?.id) {
    res.json({ cart_id: cart.id, created: false, line_item_id: existing.id })
    return
  }

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: cart.id,
      items: [line],
    },
  })

  res.json({ cart_id: cart.id, created: true })
}
