import { createHmac } from "crypto"
import {
  classifyPaymentFailure,
  customerPaymentMessage,
  isKnownPaymentEvent,
  mayCompleteOrder,
  paymentMode,
  paymentSettings,
  verifyWebhookSignature,
} from "../contract"

describe("payment contract", () => {
  it("keeps the manual provider completable while it is still pending", () => {
    expect(
      mayCompleteOrder({
        providerId: "pp_system_default",
        sessionStatus: "pending",
      })
    ).toBe(true)
  })

  it("does not complete an order for an unconfirmed production session", () => {
    expect(
      mayCompleteOrder({
        providerId: "pp_future_provider",
        sessionStatus: "pending",
      })
    ).toBe(false)
    expect(
      mayCompleteOrder({
        providerId: "pp_future_provider",
        sessionStatus: "authorized",
      })
    ).toBe(true)
  })

  it("refuses canceled and missing sessions", () => {
    expect(
      mayCompleteOrder({
        providerId: "pp_system_default",
        sessionStatus: "canceled",
      })
    ).toBe(false)
    expect(mayCompleteOrder({ providerId: null, sessionStatus: "authorized" })).toBe(
      false
    )
  })

  it("hides stacks and classifies connection, pending, and rejected", () => {
    expect(classifyPaymentFailure("fetch failed")).toBe("connection")
    expect(classifyPaymentFailure("payment requires_action")).toBe("pending")
    expect(classifyPaymentFailure("card declined")).toBe("rejected")
    expect(
      customerPaymentMessage(new Error("Error\n    at placeOrder (cart.ts:10:1)"))
    ).toBe("Pago rechazado.")
    expect(customerPaymentMessage("ECONNREFUSED")).toBe(
      "No pudimos conectar. Inténtalo de nuevo."
    )
    expect(customerPaymentMessage("postgres://user:secret@host/db")).not.toContain(
      "postgres"
    )
  })

  it("rejects a webhook without a matching signature", () => {
    const body = JSON.stringify({ type: "payment.succeeded" })
    const secret = "test-webhook-secret"
    const signature = createHmac("sha256", secret).update(body).digest("hex")

    expect(verifyWebhookSignature(body, signature, secret)).toBe(true)
    expect(verifyWebhookSignature(body, "sha256=" + signature, secret)).toBe(true)
    expect(verifyWebhookSignature(body, signature, "other-secret")).toBe(false)
    expect(verifyWebhookSignature(body, undefined, secret)).toBe(false)
  })

  it("accepts only the prepared payment events", () => {
    expect(isKnownPaymentEvent("payment.succeeded")).toBe(true)
    expect(isKnownPaymentEvent("payment.failed")).toBe(true)
    expect(isKnownPaymentEvent("payment.refunded")).toBe(true)
    expect(isKnownPaymentEvent("payment.cancelled")).toBe(true)
    expect(isKnownPaymentEvent("payment.created")).toBe(false)
  })

  it("keeps live and test secrets apart and leaves the provider unset", () => {
    expect(paymentMode({ SERENDIPITY_PAYMENT_MODE: "live" })).toBe("live")
    expect(paymentMode({})).toBe("test")
    expect(
      paymentSettings({
        SERENDIPITY_PAYMENT_MODE: "test",
        SERENDIPITY_PAYMENT_TEST_WEBHOOK_SECRET: "test-secret",
        SERENDIPITY_PAYMENT_LIVE_WEBHOOK_SECRET: "live-secret",
      })
    ).toEqual({
      mode: "test",
      providerId: null,
      webhookSecret: "test-secret",
    })
  })
})
