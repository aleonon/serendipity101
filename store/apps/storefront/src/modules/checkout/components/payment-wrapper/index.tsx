"use client"

import { HttpTypes } from "@medusajs/types"
import dynamic from "next/dynamic"
import React from "react"

import { isStripeLike } from "@lib/constants"

const StripeCheckout = dynamic(() => import("./stripe-checkout"), {
  ssr: false,
})

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending"
  )

  if (
    stripeKey &&
    paymentSession &&
    isStripeLike(paymentSession.provider_id)
  ) {
    return (
      <StripeCheckout paymentSession={paymentSession}>
        {children}
      </StripeCheckout>
    )
  }

  return <>{children}</>
}

export default PaymentWrapper
