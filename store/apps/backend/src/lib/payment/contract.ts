import { createHmac, timingSafeEqual } from "crypto"

/** Built-in Medusa provider. Development and sandbox only. */
export const SYSTEM_PAYMENT_PROVIDER_ID = "pp_system_default"

export const PAYMENT_WEBHOOK_EVENTS = [
  "payment.succeeded",
  "payment.failed",
  "payment.refunded",
  "payment.cancelled",
] as const

export type PaymentWebhookEvent = (typeof PAYMENT_WEBHOOK_EVENTS)[number]

export type PaymentUiStatus =
  | "idle"
  | "processing"
  | "rejected"
  | "pending"
  | "connection"
  | "success"

const CUSTOMER_MESSAGES: Record<Exclude<PaymentUiStatus, "idle" | "success">, string> = {
  processing: "Procesando pago",
  rejected: "Pago rechazado.",
  pending: "Pago pendiente.",
  connection: "No pudimos conectar. Inténtalo de nuevo.",
}

export function paymentStatusMessage(
  status: Exclude<PaymentUiStatus, "idle" | "success">
): string {
  return CUSTOMER_MESSAGES[status]
}

/**
 * Turns an unknown failure into a customer-facing status.
 * The raw message, stack, and connection strings are never returned.
 */
export function classifyPaymentFailure(input: unknown): "rejected" | "pending" | "connection" {
  const raw = rawMessage(input)
  if (/ECONN|ENOTFOUND|fetch failed|network|no response|socket/i.test(raw)) {
    return "connection"
  }
  if (/pending|requires_more|requires_action|processing/i.test(raw)) {
    return "pending"
  }
  return "rejected"
}

export function customerPaymentMessage(input: unknown): string {
  return paymentStatusMessage(classifyPaymentFailure(input))
}

/**
 * An order is created only after the payment session can be completed.
 * The manual provider authorizes during cart completion, so a pending
 * session is expected. Any other provider must already be authorized
 * or captured. A pending production payment does not create an order.
 */
export function mayCompleteOrder(input: {
  providerId?: string | null
  sessionStatus?: string | null
}): boolean {
  const providerId = input.providerId ?? ""
  const sessionStatus = input.sessionStatus ?? ""

  if (!providerId) {
    return false
  }

  if (
    sessionStatus === "error" ||
    sessionStatus === "canceled" ||
    sessionStatus === "cancelled"
  ) {
    return false
  }

  if (providerId.startsWith(SYSTEM_PAYMENT_PROVIDER_ID)) {
    return (
      sessionStatus === "" ||
      sessionStatus === "pending" ||
      sessionStatus === "authorized" ||
      sessionStatus === "captured"
    )
  }

  return sessionStatus === "authorized" || sessionStatus === "captured"
}

export function isKnownPaymentEvent(value: unknown): value is PaymentWebhookEvent {
  return (
    typeof value === "string" &&
    (PAYMENT_WEBHOOK_EVENTS as readonly string[]).includes(value)
  )
}

export type PaymentMode = "test" | "live"

export function paymentMode(env: NodeJS.ProcessEnv = process.env): PaymentMode {
  return env.SERENDIPITY_PAYMENT_MODE === "live" ? "live" : "test"
}

/**
 * Production stays unconfigured until a provider id is chosen.
 * Secrets are read from mode-specific variables and never returned to the browser.
 */
export function paymentSettings(env: NodeJS.ProcessEnv = process.env): {
  mode: PaymentMode
  providerId: string | null
  webhookSecret: string | null
} {
  const mode = paymentMode(env)
  const prefix = mode === "live" ? "LIVE" : "TEST"
  const providerId = env.SERENDIPITY_PAYMENT_PROVIDER?.trim() || null
  const webhookSecret =
    env[`SERENDIPITY_PAYMENT_${prefix}_WEBHOOK_SECRET`]?.trim() || null

  return { mode, providerId, webhookSecret }
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature || !secret || !rawBody) {
    return false
  }

  const provided = signature.startsWith("sha256=")
    ? signature.slice("sha256=".length)
    : signature
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

function rawMessage(input: unknown): string {
  if (input instanceof Error) {
    return input.message
  }
  if (typeof input === "string") {
    return input
  }
  return ""
}
