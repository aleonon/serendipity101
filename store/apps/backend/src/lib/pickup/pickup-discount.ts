import {
  PICKUP_DISCOUNT_RATE,
  PICKUP_FULFILLMENT_SET_TYPE,
  PICKUP_OPTION_TYPE_CODE,
  PICKUP_PROMOTION_CODE,
} from "./constants"

export type ShippingOptionSignal = {
  id: string
  name?: string | null
  fulfillmentSetType?: string | null
  typeCode?: string | null
}

export type PricedLine = {
  subtotal: number
  metadata?: Record<string, unknown> | null
}

/**
 * Pickup is a fulfillment-set type or a shipping-option type code.
 * The visible name is not a signal.
 */
export function isLocalPickupOption(option: ShippingOptionSignal): boolean {
  return (
    option.fulfillmentSetType === PICKUP_FULFILLMENT_SET_TYPE ||
    option.typeCode === PICKUP_OPTION_TYPE_CODE
  )
}

/**
 * Decides the discount from the shipping option resolved on the server.
 * A client flag is accepted in the input only so tests can prove it is ignored.
 */
export function pickupDiscountDecision(input: {
  resolvedOption: ShippingOptionSignal | null
  clientPickup?: boolean
}): "apply" | "remove" {
  if (!input.resolvedOption || !isLocalPickupOption(input.resolvedOption)) {
    return "remove"
  }

  return "apply"
}

/** 5% of the eligible item subtotal. Shipping is not included. */
export function pickupDiscountAmount(itemSubtotal: number): number {
  if (!Number.isFinite(itemSubtotal) || itemSubtotal <= 0) {
    return 0
  }

  return Math.round(itemSubtotal * PICKUP_DISCOUNT_RATE * 100) / 100
}

/**
 * Sums item subtotals. Line metadata, including Blend Builder snapshots,
 * does not change eligibility.
 */
export function eligibleItemSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => {
    if (!Number.isFinite(line.subtotal) || line.subtotal <= 0) {
      return sum
    }

    return sum + line.subtotal
  }, 0)
}

/**
 * Keeps a single pickup promotion code. Repeating apply does not stack it.
 */
export function syncPickupPromotionCodes(
  existingCodes: string[],
  decision: "apply" | "remove"
): string[] {
  const withoutPickup = existingCodes.filter(
    (code) => code !== PICKUP_PROMOTION_CODE
  )

  if (decision === "remove") {
    return withoutPickup
  }

  return [...withoutPickup, PICKUP_PROMOTION_CODE]
}
