import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function setupEcuadorRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "countries.iso_2"],
  })

  const hasEcuadorRegion = regions.some((region) =>
    region.countries?.some(
      (country: { iso_2?: string | null } | null) =>
        country?.iso_2?.toLowerCase() === "ec"
    )
  )

  if (hasEcuadorRegion) {
    logger.info("Ecuador region already exists; no changes made.")
    return
  }

  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Ecuador",
          currency_code: "usd",
          countries: ["ec"],
        },
      ],
    },
  })

  logger.info("Created Ecuador region with USD currency.")
}
