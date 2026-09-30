import { HttpTypes } from "@medusajs/types"

/** Matches the automatic promotion created in the backend. Not a customer-facing code. */
export const PICKUP_PROMOTION_CODE = "SERENDIPITY_PICKUP_5"

export const PICKUP_FULFILLMENT_SET_TYPE = "pickup"

type PickupOption = {
  service_zone?: {
    fulfillment_set?: { type?: string | null } | null
  } | null
}

export function isPickupShippingOption(option: unknown): boolean {
  if (!option || typeof option !== "object") {
    return false
  }

  const fulfillmentSet = (option as PickupOption).service_zone?.fulfillment_set
  return fulfillmentSet?.type === PICKUP_FULFILLMENT_SET_TYPE
}

function adjustmentAmount(
  adjustment: { code?: string | null; amount?: number | null } | null
): number {
  if (adjustment?.code !== PICKUP_PROMOTION_CODE) {
    return 0
  }

  return typeof adjustment.amount === "number" ? adjustment.amount : 0
}

/**
 * Pickup discount already calculated by Medusa on the cart line items.
 * Returns 0 when the promotion is not on the cart.
 */
export function pickupDiscountFromCart(
  cart: HttpTypes.StoreCart | HttpTypes.StoreOrder
): number {
  const items = cart.items ?? []
  const fromAdjustments = items.reduce((sum, item) => {
    const adjustments = item.adjustments ?? []
    return (
      sum +
      adjustments.reduce(
        (lineSum, adjustment) => lineSum + adjustmentAmount(adjustment),
        0
      )
    )
  }, 0)

  if (fromAdjustments > 0) {
    return fromAdjustments
  }

  const promotions = "promotions" in cart ? cart.promotions ?? [] : []
  const hasPickupPromo = promotions.some(
    (promotion) => promotion.code === PICKUP_PROMOTION_CODE
  )
  const hasOtherPromo = promotions.some(
    (promotion) =>
      Boolean(promotion.code) && promotion.code !== PICKUP_PROMOTION_CODE
  )

  if (!hasPickupPromo || hasOtherPromo) {
    return 0
  }

  const totals = cart as { discount_subtotal?: number | null }
  return totals.discount_subtotal ?? 0
}
