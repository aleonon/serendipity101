import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import { createPromotionsWorkflow, createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  PICKUP_DISCOUNT_RATE,
  PICKUP_FULFILLMENT_SET_TYPE,
  PICKUP_OPTION_NAME,
  PICKUP_OPTION_TYPE_CODE,
  PICKUP_PROMOTION_CODE,
  PICKUP_RULE_ATTRIBUTE,
  PICKUP_SET_NAME,
  PICKUP_ZONE_NAME,
} from "../lib/pickup/constants"

const ECUADOR_ISO = "ec"
const LOCATION_NAME = "Serendipity Store"
const FULFILLMENT_PROVIDER_ID = "manual_manual"
const DELIVERY_OPTION_NAME = "Envío estándar"

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
  address?: {
    address_1?: string | null
    city?: string | null
  } | null
  fulfillment_sets?: FulfillmentSet[] | null
}
type ShippingOption = {
  id: string
  name?: string | null
  service_zone?: {
    id?: string
    fulfillment_set?: { id?: string; type?: string | null } | null
  } | null
  type?: { id?: string; code?: string | null } | null
}
type PromotionRuleValue = { value?: string | null }
type PromotionRule = {
  id?: string
  attribute?: string | null
  values?: PromotionRuleValue[] | null
}
type Promotion = {
  id: string
  code?: string | null
  is_automatic?: boolean | null
  rules?: PromotionRule[] | null
  application_method?: {
    type?: string | null
    target_type?: string | null
    value?: number | null
  } | null
}

function zoneIncludesEcuador(zone: ServiceZone | null | undefined) {
  return (zone?.geo_zones ?? []).some(
    (geo) => geo?.country_code?.toLowerCase() === ECUADOR_ISO
  )
}

export default async function setupSerendipityPickup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModule = container.resolve(ModuleRegistrationName.FULFILLMENT)
  const promotionModule = container.resolve(Modules.PROMOTION)

  const [
    { data: locations },
    { data: regions },
    { data: profiles },
    { data: products },
    { data: shippingOptions },
    { data: promotions },
  ] = await Promise.all([
    query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "name",
        "address.address_1",
        "address.city",
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
      entity: "region",
      fields: ["id", "name", "currency_code", "countries.iso_2"],
    }),
    query.graph({
      entity: "shipping_profile",
      fields: ["id", "name", "type"],
    }),
    query.graph({
      entity: "product",
      fields: ["id", "shipping_profile.id"],
    }),
    query.graph({
      entity: "shipping_option",
      fields: [
        "id",
        "name",
        "service_zone.id",
        "service_zone.fulfillment_set.id",
        "service_zone.fulfillment_set.type",
        "type.id",
        "type.code",
      ],
    }),
    query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "is_automatic",
        "application_method.type",
        "application_method.target_type",
        "application_method.value",
        "rules.id",
        "rules.attribute",
        "rules.values.value",
      ],
    }),
  ])

  const ecuadorRegion = regions.find((region) =>
    region.countries?.some(
      (country: { iso_2?: string | null } | null) =>
        country?.iso_2?.toLowerCase() === ECUADOR_ISO
    )
  )

  if (!ecuadorRegion?.id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Ecuador region is missing. Refusing to create a duplicate region."
    )
  }

  const location = (locations as StockLocation[]).find(
    (entry) => entry.name === LOCATION_NAME
  )

  if (!location) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Stock location "${LOCATION_NAME}" is missing. Refusing to create another location.`
    )
  }

  const deliveryOption = (shippingOptions as ShippingOption[]).find(
    (option) => option.name === DELIVERY_OPTION_NAME
  )

  if (!deliveryOption) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Delivery option "${DELIVERY_OPTION_NAME}" is missing. Refusing to replace it.`
    )
  }

  logger.info(
    `Reusing region ${ecuadorRegion.name}, location ${LOCATION_NAME}, delivery "${DELIVERY_OPTION_NAME}" (${deliveryOption.id}). Address on file: ${location.address?.address_1 ? "yes" : "no"}.`
  )

  let pickupSet = (location.fulfillment_sets ?? []).find(
    (set) => set.type === PICKUP_FULFILLMENT_SET_TYPE
  )

  if (!pickupSet?.id) {
    const created = await fulfillmentModule.createFulfillmentSets({
      name: PICKUP_SET_NAME,
      type: PICKUP_FULFILLMENT_SET_TYPE,
      service_zones: [
        {
          name: PICKUP_ZONE_NAME,
          geo_zones: [{ country_code: ECUADOR_ISO, type: "country" }],
        },
      ],
    })

    if (!created.id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Pickup fulfillment set was created without an id."
      )
    }

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: created.id },
    })

    pickupSet = {
      id: created.id,
      name: created.name,
      type: created.type,
      service_zones: created.service_zones,
    }

    logger.info(
      `Created pickup fulfillment set "${PICKUP_SET_NAME}" (${created.id}).`
    )
  } else {
    logger.info(
      `Pickup fulfillment set already exists (${pickupSet.id}); not duplicating it.`
    )
  }

  let serviceZone =
    (pickupSet.service_zones ?? []).find((zone) => zoneIncludesEcuador(zone)) ??
    pickupSet.service_zones?.[0]

  if (!serviceZone?.id) {
    const fulfillmentSetId = pickupSet.id
    if (!fulfillmentSetId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Pickup fulfillment set is missing an id."
      )
    }

    const createdZone = await fulfillmentModule.createServiceZones({
      name: PICKUP_ZONE_NAME,
      fulfillment_set_id: fulfillmentSetId,
      geo_zones: [{ country_code: ECUADOR_ISO, type: "country" }],
    })
    serviceZone = createdZone
    logger.info(`Created pickup service zone (${createdZone.id}).`)
  }

  if (!serviceZone?.id) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Pickup service zone is missing an id."
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
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No shipping profile found for Serendipity products."
    )
  }

  let pickupOption = (shippingOptions as ShippingOption[]).find((option) => {
    const setType = option.service_zone?.fulfillment_set?.type
    return (
      setType === PICKUP_FULFILLMENT_SET_TYPE &&
      (option.name === PICKUP_OPTION_NAME ||
        option.type?.code === PICKUP_OPTION_TYPE_CODE)
    )
  })

  if (!pickupOption) {
    const { result } = await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: PICKUP_OPTION_NAME,
          price_type: "flat",
          provider_id: FULFILLMENT_PROVIDER_ID,
          service_zone_id: serviceZone.id,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "Retiro",
            description: "Retiro en el local. El 5% lo aplica la promoción automática.",
            code: PICKUP_OPTION_TYPE_CODE,
          },
          prices: [
            { currency_code: "usd", amount: 0 },
            { region_id: ecuadorRegion.id, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })

    const created = result?.[0]
    if (!created?.id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Pickup shipping option was created without an id."
      )
    }

    pickupOption = {
      id: created.id,
      name: created.name,
    }
    logger.info(
      `Created shipping option "${PICKUP_OPTION_NAME}" (${created.id}) at $0.`
    )
  } else {
    logger.info(
      `Pickup shipping option already exists (${pickupOption.id}); not duplicating it.`
    )
  }

  const existingPromotion = (promotions as Promotion[]).find(
    (promotion) => promotion.code === PICKUP_PROMOTION_CODE
  )

  if (!existingPromotion) {
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code: PICKUP_PROMOTION_CODE,
            type: "standard",
            status: "active",
            is_automatic: true,
            is_tax_inclusive: false,
            application_method: {
              type: "percentage",
              target_type: "items",
              allocation: "across",
              value: PICKUP_DISCOUNT_RATE * 100,
              currency_code: "usd",
            },
            rules: [
              {
                attribute: PICKUP_RULE_ATTRIBUTE,
                operator: "in",
                values: [pickupOption.id],
              },
            ],
          },
        ],
      },
    })
    logger.info(
      `Created automatic promotion ${PICKUP_PROMOTION_CODE} for option ${pickupOption.id}.`
    )
  } else {
    const pickupRule = (existingPromotion.rules ?? []).find(
      (rule) => rule.attribute === PICKUP_RULE_ATTRIBUTE
    )
    const values = (pickupRule?.values ?? [])
      .map((entry) => entry.value)
      .filter((value): value is string => Boolean(value))

    if (!pickupRule?.id || !values.includes(pickupOption.id)) {
      if (pickupRule?.id) {
        await promotionModule.updatePromotionRules([
          {
            id: pickupRule.id,
            attribute: PICKUP_RULE_ATTRIBUTE,
            operator: "in",
            values: [pickupOption.id],
          },
        ])
        logger.info(
          `Updated pickup promotion rule to option ${pickupOption.id}.`
        )
      } else {
        await promotionModule.addPromotionRules(existingPromotion.id, [
          {
            attribute: PICKUP_RULE_ATTRIBUTE,
            operator: "in",
            values: [pickupOption.id],
          },
        ])
        logger.info(
          `Added pickup promotion rule for option ${pickupOption.id}.`
        )
      }
    } else {
      logger.info(
        `Pickup promotion ${existingPromotion.id} already targets ${pickupOption.id}.`
      )
    }
  }

  logger.info(
    `Pickup ready. option=${pickupOption.id} set=${pickupSet.id} zone=${serviceZone.id} delivery=${deliveryOption.id}`
  )
}
