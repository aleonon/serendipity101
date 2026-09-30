"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
  pickupDiscount?: number | null
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, pickupDiscount }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals
  const pickupAmount =
    typeof pickupDiscount === "number" && pickupDiscount > 0
      ? pickupDiscount
      : 0
  const otherDiscount = Math.max((discount_subtotal ?? 0) - pickupAmount, 0)

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (sin envío ni impuestos)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Envío</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {pickupAmount > 0 && (
          <div className="flex items-center justify-between">
            <span>Retiro en local</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-pickup-discount"
              data-value={pickupAmount}
            >
              -{" "}
              {convertToLocale({
                amount: pickupAmount,
                currency_code,
              })}
            </span>
          </div>
        )}
        {otherDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span>Descuento</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={otherDiscount}
            >
              -{" "}
              {convertToLocale({
                amount: otherDiscount,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Impuestos</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
