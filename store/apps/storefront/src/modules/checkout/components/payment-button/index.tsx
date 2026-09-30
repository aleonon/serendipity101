"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import {
  classifyPaymentFailure,
  paymentStatusMessage,
  type PaymentUiStatus,
} from "@lib/payment/status"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Selecciona un método de pago</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<PaymentUiStatus>("idle")

  const onPaymentCompleted = async () => {
    await placeOrder()
      .then(() => {
        setStatus("success")
      })
      .catch((err: unknown) => {
        setStatus(classifyPaymentFailure(err))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const { countryCode } = useParams()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setStatus("processing")
    setSubmitting(true)

    await stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-return?cart_id=${cart.id}&country_code=${countryCode}`,
          payment_method_data: {
            billing_details: {
              name:
                cart.billing_address?.first_name +
                " " +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        },
        // Only leave the site when the selected method actually requires it, so
        // card payments still complete inline.
        redirect: "if_required",
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setStatus(classifyPaymentFailure(error.message || error))
          setSubmitting(false)
          return
        }

        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        if (
          paymentIntent.status === "processing" ||
          paymentIntent.status === "requires_action"
        ) {
          setStatus("pending")
          setSubmitting(false)
          return
        }

        setStatus("rejected")
        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {status === "processing" ? "Procesando pago" : status === "connection" || status === "rejected" ? "Reintentar" : "Confirmar pedido"}
      </Button>
      <PaymentStatus status={status} testId="stripe-payment-error-message" />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<PaymentUiStatus>("idle")

  const onPaymentCompleted = async () => {
    await placeOrder()
      .then(() => {
        setStatus("success")
      })
      .catch((err: unknown) => {
        setStatus(classifyPaymentFailure(err))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setStatus("processing")
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {status === "processing"
          ? "Procesando pago"
          : status === "connection" || status === "rejected"
            ? "Reintentar"
            : "Confirmar pedido"}
      </Button>
      <PaymentStatus status={status} testId="manual-payment-error-message" />
    </>
  )
}

function PaymentStatus({
  status,
  testId,
}: {
  status: PaymentUiStatus
  testId: string
}) {
  if (
    status === "idle" ||
    status === "processing" ||
    status === "success"
  ) {
    return null
  }

  return (
    <ErrorMessage
      error={paymentStatusMessage(status)}
      data-testid={testId}
    />
  )
}

export default PaymentButton
