import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const SERENDIPITY_HANDLES = [
  "flor-de-jamaica",
  "menta",
  "manzanilla",
  "lavanda",
  "hierba-luisa",
  "rosa-frambuesa",
  "flores-andinas",
] as const

export default async function auditSerendipityCommerce({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [
    { data: regions },
    { data: salesChannels },
    { data: stockLocations },
    { data: shippingProfiles },
    { data: categories },
    { data: products },
  ] = await Promise.all([
    query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code", "countries.iso_2"],
    }),
    query.graph({
      entity: "sales_channel",
      fields: ["id", "name", "is_disabled"],
    }),
    query.graph({
      entity: "stock_location",
      fields: ["id", "name", "sales_channels.id", "sales_channels.name"],
    }),
    query.graph({
      entity: "shipping_profile",
      fields: ["id", "name"],
    }),
    query.graph({
      entity: "product_category",
      fields: ["id", "name", "handle"],
    }),
    query.graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "title",
        "status",
        "thumbnail",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "sales_channels.id",
        "sales_channels.name",
        "categories.handle",
      ],
    }),
  ])

  logger.info("--- Regions ---")
  for (const region of regions) {
    const countries = (region.countries ?? [])
      .map((country: { iso_2?: string | null } | null) => country?.iso_2)
      .filter(Boolean)
      .join(",")
    logger.info(
      `${region.name} | ${region.currency_code} | ${countries} | ${region.id}`
    )
  }

  logger.info("--- Sales channels ---")
  for (const channel of salesChannels) {
    logger.info(
      `${channel.name} | disabled=${channel.is_disabled} | ${channel.id}`
    )
  }

  logger.info("--- Stock locations ---")
  for (const location of stockLocations) {
    const channels = (location.sales_channels ?? [])
      .map((channel: { name?: string | null } | null) => channel?.name)
      .filter(Boolean)
      .join(",")
    logger.info(`${location.name} | channels=${channels || "(none)"}`)
  }

  logger.info(`--- Shipping profiles: ${shippingProfiles.length} ---`)
  logger.info("--- Categories ---")
  for (const category of categories) {
    logger.info(`${category.name} / ${category.handle}`)
  }

  const serendipity = products.filter((product) =>
    SERENDIPITY_HANDLES.includes(
      product.handle as (typeof SERENDIPITY_HANDLES)[number]
    )
  )
  const other = products.filter(
    (product) =>
      !SERENDIPITY_HANDLES.includes(
        product.handle as (typeof SERENDIPITY_HANDLES)[number]
      )
  )

  logger.info(
    `--- Products: ${products.length} total, ${serendipity.length} Serendipity, ${other.length} other ---`
  )

  const skus = serendipity.flatMap((product) =>
    (product.variants ?? [])
      .map((variant) => variant.sku)
      .filter((sku): sku is string => Boolean(sku))
  )

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: skus },
  })

  const inventoryBySku = new Map(
    inventoryItems.map((item) => [item.sku, item.id])
  )

  const inventoryItemIds = inventoryItems
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id))

  const { data: inventoryLevels } = inventoryItemIds.length
    ? await query.graph({
        entity: "inventory_level",
        fields: [
          "id",
          "inventory_item_id",
          "stocked_quantity",
          "reserved_quantity",
          "location_id",
        ],
        filters: { inventory_item_id: inventoryItemIds },
      })
    : { data: [] }

  const levelsByItem = new Map(
    inventoryLevels.map((level) => [level.inventory_item_id, level])
  )

  for (const product of serendipity) {
    const channels = (product.sales_channels ?? [])
      .map((channel: { name?: string | null } | null) => channel?.name)
      .filter(Boolean)
    const cats = (product.categories ?? [])
      .map((category: { handle?: string | null } | null) => category?.handle)
      .filter(Boolean)
    logger.info(
      `${product.handle} | status=${product.status} | variants=${product.variants?.length ?? 0} | thumb=${Boolean(product.thumbnail)} | channels=${channels.join(",") || "(none)"} | cats=${cats.join(",") || "(none)"}`
    )

    for (const variant of product.variants ?? []) {
      const inventoryItemId = variant.sku
        ? inventoryBySku.get(variant.sku)
        : undefined
      const level = inventoryItemId
        ? levelsByItem.get(inventoryItemId)
        : undefined
      logger.info(
        `  ${variant.title} sku=${variant.sku} manage=${variant.manage_inventory} stocked=${level?.stocked_quantity ?? "NONE"} reserved=${level?.reserved_quantity ?? "NONE"}`
      )
    }
  }

  if (other.length) {
    logger.info("--- Other products (not Serendipity demo) ---")
    for (const product of other) {
      logger.info(`${product.handle} | status=${product.status}`)
    }
  }

  logger.info(
    `Inventory items resolved for Serendipity variants: ${inventoryItemIds.length}`
  )
}
