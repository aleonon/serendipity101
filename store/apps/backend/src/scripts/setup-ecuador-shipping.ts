import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const ECUADOR_ISO = "ec"
const LOCATION_NAME = "Serendipity Store"
const FULFILLMENT_SET_NAME = "Serendipity Ecuador"
const SERVICE_ZONE_NAME = "Ecuador"
const SHIPPING_OPTION_NAME = "Envío estándar"
const FULFILLMENT_PROVIDER_ID = "manual_manual"
const PAYMENT_PROVIDER_ID = "pp_system_default"
const TAX_PROVIDER_ID = "tp_system"
/** Major-unit USD amount. Shown in checkout as $5.00. Demo only. */
const DEMO_SHIPPING_AMOUNT = 5

type GeoZone = { country_code?: string | null; type?: string | null }
type ServiceZone = {
  id?: string
  name?: string | null
  geo_zones?: GeoZone[] | null
}
type FulfillmentSet = {
  id?: string
  name?: string | null
  type?: string | null
  service_zones?: ServiceZone[] | null
}
type StockLocation = {
  id: string
  name?: string | null
  fulfillment_sets?: FulfillmentSet[] | null
  fulfillment_providers?: { id?: string | null }[] | null
  sales_channels?: { id?: string | null; name?: string | null }[] | null
}

function zoneIncludesEcuador(zone: ServiceZone | null | undefined) {
  return (zone?.geo_zones ?? []).some(
    (geo) => geo?.country_code?.toLowerCase() === ECUADOR_ISO
  )
}

export default async function setupEcuadorShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  const [
    { data: locations },
    { data: shippingOptions },
    { data: regions },
    { data: profiles },
    { data: products },
    { data: paymentProviders },
    { data: taxRegions },
  ] = await Promise.all([
    query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "name",
        "sales_channels.id",
        "sales_channels.name",
        "fulfillment_providers.id",
        "fulfillment_sets.id",
        "fulfillment_sets.name",
        "fulfillment_sets.type",
        "fulfillment_sets.service_zones.id",
        "fulfillment_sets.service_zones.name",
        "fulfillment_sets.service_zones.geo_zones.country_code",
        "fulfillment_sets.service_zones.geo_zones.type",
      ],
    }),
    query.graph({
      entity: "shipping_option",
      fields: [
        "id",
        "name",
        "price_type",
        "provider_id",
        "shipping_profile_id",
        "service_zone.id",
        "service_zone.name",
        "service_zone.geo_zones.country_code",
      ],
    }),
    query.graph({
      entity: "region",
      fields: [
        "id",
        "name",
        "currency_code",
        "countries.iso_2",
        "payment_providers.id",
      ],
    }),
    query.graph({
      entity: "shipping_profile",
      fields: ["id", "name", "type"],
    }),
    query.graph({
      entity: "product",
      fields: ["id", "handle", "shipping_profile.id", "shipping_profile.name"],
    }),
    query.graph({
      entity: "payment_provider",
      fields: ["id", "is_enabled"],
    }),
    query.graph({
      entity: "tax_region",
      fields: ["id", "country_code", "provider_id"],
    }),
  ])

  logger.info("--- Fulfillment before ---")
  for (const location of locations as StockLocation[]) {
    const sets = location.fulfillment_sets ?? []
    logger.info(
      `location ${location.name} | channels=${(location.sales_channels ?? [])
        .map((channel) => channel?.name)
        .join(",")} | providers=${(location.fulfillment_providers ?? [])
        .map((provider) => provider?.id)
        .join(",")}`
    )
    for (const set of sets) {
      const zones = (set.service_zones ?? [])
        .map(
          (zone) =>
            `${zone?.name}:[${(zone?.geo_zones ?? [])
              .map((geo) => geo?.country_code)
              .join(",")}]`
        )
        .join(" ")
      logger.info(`  set ${set.name} type=${set.type} zones=${zones}`)
    }
  }

  for (const option of shippingOptions) {
    const zone = option.service_zone as ServiceZone | null
    const countries = (zone?.geo_zones ?? [])
      .map((geo) => geo?.country_code)
      .join(",")
    logger.info(
      `option ${option.name} | zone=${zone?.name} | countries=${countries} | provider=${option.provider_id} | profile=${option.shipping_profile_id}`
    )
  }

  const ecuadorRegion = regions.find((region) =>
    region.countries?.some(
      (country: { iso_2?: string | null } | null) =>
        country?.iso_2?.toLowerCase() === ECUADOR_ISO
    )
  )

  if (!ecuadorRegion) {
    throw new Error("Ecuador region is missing. Refusing to create a duplicate.")
  }

  logger.info(
    `region ${ecuadorRegion.name} | ${ecuadorRegion.currency_code} | providers=${(
      ecuadorRegion.payment_providers ?? []
    )
      .map((provider) => provider?.id)
      .join(",")}`
  )

  const location = (locations as StockLocation[]).find(
    (entry) => entry.name === LOCATION_NAME
  )

  if (!location) {
    throw new Error(
      `Stock location "${LOCATION_NAME}" is missing. Refusing to create another location.`
    )
  }

  const existingEcuadorZone = (location.fulfillment_sets ?? [])
    .flatMap((set) => set.service_zones ?? [])
    .find((zone) => zoneIncludesEcuador(zone))

  let serviceZoneId = existingEcuadorZone?.id

  if (!serviceZoneId) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: SERVICE_ZONE_NAME,
          geo_zones: [{ country_code: ECUADOR_ISO, type: "country" }],
        },
      ],
    })

    serviceZoneId = fulfillmentSet.service_zones?.[0]?.id

    if (!fulfillmentSet.id || !serviceZoneId) {
      throw new Error("Fulfillment set was created without a service zone id.")
    }

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    logger.info(
      `Created fulfillment set "${FULFILLMENT_SET_NAME}" and linked it to ${LOCATION_NAME}.`
    )
  } else {
    logger.info(
      `Ecuador service zone already exists (${serviceZoneId}); not duplicating it.`
    )
  }

  const providerLinked = (location.fulfillment_providers ?? []).some(
    (provider) => provider?.id === FULFILLMENT_PROVIDER_ID
  )

  if (!providerLinked) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: FULFILLMENT_PROVIDER_ID,
      },
    })
    logger.info(
      `Linked fulfillment provider ${FULFILLMENT_PROVIDER_ID} to ${LOCATION_NAME}.`
    )
  }

  const profileIds = new Set(
    products
      .map(
        (product) =>
          (product.shipping_profile as { id?: string | null } | null)?.id
      )
      .filter((id): id is string => Boolean(id))
  )

  const shippingProfileId =
    profileIds.size === 1
      ? [...profileIds][0]
      : (profiles[0] as { id?: string } | undefined)?.id

  if (!shippingProfileId) {
    throw new Error("No shipping profile found for Serendipity products.")
  }

  const optionExists = shippingOptions.some((option) => {
    const zone = option.service_zone as ServiceZone | null
    return (
      option.name === SHIPPING_OPTION_NAME &&
      (zone?.id === serviceZoneId || zoneIncludesEcuador(zone))
    )
  })

  if (!optionExists) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: SHIPPING_OPTION_NAME,
          price_type: "flat",
          provider_id: FULFILLMENT_PROVIDER_ID,
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "Estándar",
            description: "Tarifa DEMO de desarrollo. No es el envío final.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "usd",
              amount: DEMO_SHIPPING_AMOUNT,
            },
            {
              region_id: ecuadorRegion.id,
              amount: DEMO_SHIPPING_AMOUNT,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    })
    logger.info(
      `Created shipping option "${SHIPPING_OPTION_NAME}" at $${DEMO_SHIPPING_AMOUNT} USD (demo).`
    )
  } else {
    logger.info(`Shipping option "${SHIPPING_OPTION_NAME}" already exists.`)
  }

  const hasTaxRegion = taxRegions.some(
    (region) => region.country_code?.toLowerCase() === ECUADOR_ISO
  )

  if (!hasTaxRegion) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: ECUADOR_ISO, provider_id: TAX_PROVIDER_ID }],
    })
    logger.info(`Created tax region for ${ECUADOR_ISO} with ${TAX_PROVIDER_ID}.`)
  }

  const systemProvider = paymentProviders.find(
    (provider) => provider.id === PAYMENT_PROVIDER_ID
  )
  const regionProviders = (ecuadorRegion.payment_providers ?? []).map(
    (provider) => provider?.id
  )

  if (systemProvider && !regionProviders.includes(PAYMENT_PROVIDER_ID)) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: ecuadorRegion.id },
        update: { payment_providers: [PAYMENT_PROVIDER_ID] },
      },
    })
    logger.info(
      `Associated existing provider ${PAYMENT_PROVIDER_ID} with region ${ecuadorRegion.name}.`
    )
  } else if (!systemProvider) {
    logger.warn(
      `Payment provider ${PAYMENT_PROVIDER_ID} is not installed. Ecuador stays without a payment provider.`
    )
  } else {
    logger.info(
      `Region ${ecuadorRegion.name} already includes ${PAYMENT_PROVIDER_ID}.`
    )
  }
}
