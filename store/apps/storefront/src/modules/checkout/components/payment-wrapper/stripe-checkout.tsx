"use client"

import { loadStripe } from "@stripe/stripe-js"
import { HttpTypes } from "@medusajs/types"
import React from "react"

import StripeWrapper from "./stripe-wrapper"

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID

const stripePromise = stripeKey
  ? loadStripe(
      stripeKey,
      medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
    )
  : null

type StripeCheckoutProps = {
  paymentSession: HttpTypes.StorePaymentSession
  children: React.ReactNode
}

const StripeCheckout = ({ paymentSession, children }: StripeCheckoutProps) => {
  return (
    <StripeWrapper
      paymentSession={paymentSession}
      stripeKey={stripeKey}
      stripePromise={stripePromise}
    >
      {children}
    </StripeWrapper>
  )
}

export default StripeCheckout
