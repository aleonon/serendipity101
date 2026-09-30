import { readFile } from "node:fs/promises"
import path from "node:path"
import type {
  CreateProductWorkflowInputDTO,
  ExecArgs,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { BLEND_PRODUCT_HANDLE } from "../lib/blend/catalog"

const DEMO_STOCK = 20
const PRESENTATION_OPTION = "Presentación"

/**
 * Demo prices in major USD units. They are development data, not approved
 * retail prices. The blend route does not add a per-ingredient price: each
 * presentation variant is the charge. A later pricing step can set
 * `unit_price` on the line from ingredient weight without new variants.
 */
const PRESENTATIONS = [
  { grams: 50, price: 8, sku: "SER-MEZCLA-50" },
  { grams: 100, price: 14, sku: "SER-MEZCLA-100" },
  { grams: 200, price: 24, sku: "SER-MEZCLA-200" },
] as const

const IMAGE_PATH = path.resolve(
  process.cwd(),
  "../storefront/public/serendipity/Catálogo/3.png"
)

export default async function seedBlendProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: [BLEND_PRODUCT_HANDLE] },
  })

  if (existing.length > 0) {
    logger.info(`${BLEND_PRODUCT_HANDLE}: already exists`)
    return
  }

  const [
    { data: regions },
    { data: salesChannels },
    { data: stockLocations },
    { data: shippingProfiles },
  ] = await Promise.all([
    query.graph({
      entity: "region",
      fields: ["id", "currency_code", "countries.iso_2"],
    }),
    query.graph({
      entity: "sales_channel",
      fields: ["id", "name", "is_disabled"],
    }),
    query.graph({
      entity: "stock_location",
      fields: ["id", "name", "sales_channels.id"],
    }),
    query.graph({
      entity: "shipping_profile",
      fields: ["id", "name", "type"],
    }),
  ])

  const ecuadorRegion = regions.find(
    (region) =>
      region.currency_code?.toLowerCase() === "usd" &&
      region.countries?.some(
        (country: { iso_2?: string | null } | null) =>
          country?.iso_2?.toLowerCase() === "ec"
      )
  )

  if (!ecuadorRegion) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Ecuador / USD region not found. The blend product was not created."
    )
  }

  const activeSalesChannels = salesChannels.filter((channel) => !channel.is_disabled)

  if (activeSalesChannels.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Expected exactly one active sales channel; found ${activeSalesChannels.length}.`
    )
  }

  const salesChannel = activeSalesChannels[0]
  const compatibleLocations = stockLocations.filter((location) =>
    location.sales_channels?.some(
      (channel: { id?: string | null } | null) => channel?.id === salesChannel.id
    )
  )

  if (compatibleLocations.length !== 1 || shippingProfiles.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The blend product needs exactly one stock location and one shipping profile."
    )
  }

  const stockLocation = compatibleLocations[0]
  const shippingProfile = shippingProfiles[0]
  const image = await readFile(IMAGE_PATH)
  const { result: uploadedFiles } = await uploadFilesWorkflow(container).run({
    input: {
      files: [
        {
          filename: "serendipity-mezcla-personalizada.png",
          mimeType: "image/png",
          content: image.toString("base64"),
          access: "public" as const,
        },
      ],
    },
  })
  const imageUrl = uploadedFiles[0]?.url

  if (!imageUrl) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The blend product image was not uploaded."
    )
  }

  const productInput: CreateProductWorkflowInputDTO = {
    handle: BLEND_PRODUCT_HANDLE,
    title: "Mezcla personalizada",
    subtitle: "Receta personalizada",
    description:
      "Una infusión armada en Serendipity. El precio de esta versión es el de la presentación. La receta viaja con el pedido.",
    status: ProductStatus.PUBLISHED,
    thumbnail: imageUrl,
    images: [{ url: imageUrl }],
    shipping_profile_id: shippingProfile.id,
    sales_channels: [{ id: salesChannel.id }],
    metadata: {
      blend_product: true,
      demo: true,
    },
    options: [
      {
        title: PRESENTATION_OPTION,
        values: PRESENTATIONS.map((presentation) => `${presentation.grams} g`),
      },
    ],
    variants: PRESENTATIONS.map((presentation) => ({
      title: `${presentation.grams} g`,
      sku: presentation.sku,
      options: {
        [PRESENTATION_OPTION]: `${presentation.grams} g`,
      },
      prices: [
        {
          amount: presentation.price,
          currency_code: "usd",
        },
      ],
      manage_inventory: true,
      allow_backorder: false,
      metadata: {
        grams: presentation.grams,
      },
    })),
  }

  await createProductsWorkflow(container).run({
    input: { products: [productInput] },
  })

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: PRESENTATIONS.map((presentation) => presentation.sku) },
  })

  if (inventoryItems.length !== PRESENTATIONS.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Expected ${PRESENTATIONS.length} inventory items; found ${inventoryItems.length}.`
    )
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((inventoryItem) => ({
        inventory_item_id: inventoryItem.id,
        location_id: stockLocation.id,
        stocked_quantity: DEMO_STOCK,
      })),
    },
  })

  logger.info(
    `${BLEND_PRODUCT_HANDLE}: created with presentations ${PRESENTATIONS.map((item) => item.grams).join(", ")} g.`
  )
}
