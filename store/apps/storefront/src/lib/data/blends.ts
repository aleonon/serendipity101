"use server"

import { sdk } from "@lib/config"
import {
  EMPTY_BLEND_CATALOG,
  type BlendCatalog,
} from "@lib/blend/types"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import { getOrSetCart } from "./cart"
import { getAuthHeaders, getCacheTag } from "./cookies"

export const getBlendCatalog = async (
  currencyCode: string
): Promise<BlendCatalog> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    return await sdk.client.fetch<BlendCatalog>("/store/blends", {
      method: "GET",
      query: { currency_code: currencyCode.toLowerCase() },
      headers,
      cache: "no-store",
    })
  } catch {
    return EMPTY_BLEND_CATALOG
  }
}

export const addBlendToCart = async (input: {
  countryCode: string
  variantId: string
  baseId: string
  ingredientIds: string[]
  blendName: string
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  try {
    const cart = await getOrSetCart(input.countryCode)

    if (!cart) {
      return { ok: false, message: "No pudimos abrir el carrito." }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch(`/store/carts/${cart.id}/blends`, {
      method: "POST",
      body: {
        variant_id: input.variantId,
        base_id: input.baseId,
        ingredient_ids: input.ingredientIds,
        blend_name: input.blendName,
      },
      headers,
    })

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return { ok: true }
  } catch (error) {
    try {
      medusaError(error)
    } catch (wrapped) {
      return {
        ok: false,
        message:
          wrapped instanceof Error
            ? wrapped.message
            : "No pudimos añadir la mezcla.",
      }
    }
  }
}
