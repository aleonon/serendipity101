import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { loadBlendCatalog, readCurrencyCode } from "../../../lib/blend/load-catalog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const requested = req.query.currency_code
  const currencyCode = readCurrencyCode(requested)

  if (
    typeof requested === "string" &&
    requested.length > 0 &&
    currencyCode !== requested
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "La moneda de la mezcla no es válida."
    )
  }

  const catalog = await loadBlendCatalog(req.scope, currencyCode)
  res.json(catalog)
}
