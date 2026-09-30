export type PaymentUiStatus =
  | "idle"
  | "processing"
  | "rejected"
  | "pending"
  | "connection"
  | "success"

const MESSAGES: Record<Exclude<PaymentUiStatus, "idle" | "success">, string> = {
  processing: "Procesando pago",
  rejected: "Pago rechazado.",
  pending: "Pago pendiente.",
  connection: "No pudimos conectar. Inténtalo de nuevo.",
}

export function paymentStatusMessage(
  status: Exclude<PaymentUiStatus, "idle" | "success">
): string {
  return MESSAGES[status]
}

/** Customer copy only. Stacks and internal details are discarded. */
export function classifyPaymentFailure(
  input: unknown
): "rejected" | "pending" | "connection" {
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
  const raw = rawMessage(input)
  if ((Object.values(MESSAGES) as string[]).includes(raw)) {
    return raw
  }
  return paymentStatusMessage(classifyPaymentFailure(input))
}

/**
 * Matches the backend rule. The manual provider may still be pending
 * because Medusa authorizes it while completing the cart. Any other
 * provider must already be authorized or captured.
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

  if (providerId.startsWith("pp_system_default")) {
    return (
      sessionStatus === "" ||
      sessionStatus === "pending" ||
      sessionStatus === "authorized" ||
      sessionStatus === "captured"
    )
  }

  return sessionStatus === "authorized" || sessionStatus === "captured"
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
