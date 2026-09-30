import { PICKUP_PROMOTION_CODE } from "../constants"
import {
  eligibleItemSubtotal,
  pickupDiscountAmount,
  pickupDiscountDecision,
  syncPickupPromotionCodes,
  type ShippingOptionSignal,
} from "../pickup-discount"

const delivery: ShippingOptionSignal = {
  id: "so_delivery",
  name: "Envío estándar",
  fulfillmentSetType: "shipping",
  typeCode: "standard",
}

const pickup: ShippingOptionSignal = {
  id: "so_pickup",
  name: "Retiro en Serendipity",
  fulfillmentSetType: "pickup",
  typeCode: "pickup",
}

describe("pickup discount", () => {
  it("does not treat a delivery option as pickup, even if the visible name matches", () => {
    const disguised: ShippingOptionSignal = {
      ...delivery,
      name: "Retiro en Serendipity",
    }

    expect(pickupDiscountDecision({ resolvedOption: disguised })).toBe("remove")
    expect(
      pickupDiscountDecision({
        resolvedOption: disguised,
        clientPickup: true,
      })
    ).toBe("remove")
  })

  it("applies 5% of the item subtotal when the resolved option is pickup", () => {
    expect(pickupDiscountDecision({ resolvedOption: pickup })).toBe("apply")
    expect(pickupDiscountAmount(40)).toBe(2)
    expect(pickupDiscountAmount(38)).toBe(1.9)
    expect(pickupDiscountAmount(0)).toBe(0)
  })

  it("removes the discount when pickup switches back to delivery", () => {
    const withPickup = syncPickupPromotionCodes([], "apply")
    const afterDelivery = syncPickupPromotionCodes(
      withPickup,
      pickupDiscountDecision({ resolvedOption: delivery })
    )

    expect(withPickup).toEqual([PICKUP_PROMOTION_CODE])
    expect(afterDelivery).toEqual([])
    expect(pickupDiscountAmount(40)).toBe(2)
  })

  it("keeps a single promotion when pickup is selected more than once", () => {
    const once = syncPickupPromotionCodes(
      [PICKUP_PROMOTION_CODE, PICKUP_PROMOTION_CODE],
      "apply"
    )
    const twice = syncPickupPromotionCodes(once, "apply")

    expect(once.filter((code) => code === PICKUP_PROMOTION_CODE)).toHaveLength(1)
    expect(twice).toEqual(once)
  })

  it("ignores a client pickup flag when the resolved option is delivery", () => {
    const codes = syncPickupPromotionCodes(
      [],
      pickupDiscountDecision({
        resolvedOption: delivery,
        clientPickup: true,
      })
    )

    expect(codes).toEqual([])
    expect(
      pickupDiscountDecision({ resolvedOption: null, clientPickup: true })
    ).toBe("remove")
  })

  it("discounts normal products and a custom blend as ordinary item subtotals", () => {
    const subtotal = eligibleItemSubtotal([
      { subtotal: 14 },
      {
        subtotal: 24,
        metadata: {
          blend_version: 1,
          name: "Mi Serendipity",
          ingredients: [{ id: "menta", percentage: 50 }],
        },
      },
    ])

    expect(subtotal).toBe(38)
    expect(pickupDiscountAmount(subtotal)).toBe(1.9)

    let codes: string[] = []
    codes = syncPickupPromotionCodes(
      codes,
      pickupDiscountDecision({ resolvedOption: delivery, clientPickup: true })
    )
    expect(codes).toEqual([])

    codes = syncPickupPromotionCodes(
      codes,
      pickupDiscountDecision({ resolvedOption: pickup })
    )
    codes = syncPickupPromotionCodes(
      codes,
      pickupDiscountDecision({ resolvedOption: delivery })
    )
    codes = syncPickupPromotionCodes(
      codes,
      pickupDiscountDecision({ resolvedOption: pickup })
    )

    expect(codes).toEqual([PICKUP_PROMOTION_CODE])
  })

  it("recognizes a pickup type code without using the display name", () => {
    expect(
      pickupDiscountDecision({
        resolvedOption: {
          id: "so_typed",
          name: "Recoger",
          fulfillmentSetType: "shipping",
          typeCode: "pickup",
        },
      })
    ).toBe("apply")
  })
})
