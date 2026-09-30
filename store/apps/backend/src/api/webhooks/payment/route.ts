import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  isKnownPaymentEvent,
  paymentSettings,
  verifyWebhookSignature,
} from "../../../lib/payment/contract"

/**
 * Provider-agnostic webhook entry.
 * The signature is checked here. The cart is not completed: no production
 * provider is registered, so a verified event is acknowledged and left
 * for the future provider module to apply.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { webhookSecret } = paymentSettings()

  if (!webhookSecret) {
    res.status(503).json({
      message: "Los webhooks de pago no están configurados.",
    })
    return
  }

  const rawBody = rawRequestBody(req)
  const signature = headerValue(req.headers["x-serendipity-signature"])

  if (!rawBody || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    res.status(401).json({
      message: "No pudimos verificar el pago.",
    })
    return
  }

  const eventType = (req.body as { type?: unknown } | undefined)?.type
  if (!isKnownPaymentEvent(eventType)) {
    res.status(400).json({
      message: "Evento de pago no reconocido.",
    })
    return
  }

  res.status(202).json({
    received: true,
    applied: false,
  })
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

function rawRequestBody(req: MedusaRequest): string | null {
  const raw = req.rawBody
  if (typeof raw === "string" && raw.length > 0) {
    return raw
  }
  if (Buffer.isBuffer(raw) && raw.length > 0) {
    return raw.toString("utf8")
  }
  return null
}
