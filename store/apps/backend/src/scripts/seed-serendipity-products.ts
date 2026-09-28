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
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"

const DEMO_STOCK = 20
const CATEGORY_NAME = "Infusiones"
const CATEGORY_HANDLE = "infusiones"
const PRESENTATION_OPTION = "Presentación"
const PRESENTATION_VALUE = "Caja"

/**
 * Medusa v2.21 accepts price amounts in major currency units.
 * These USD prices are temporary development data, not approved retail prices.
 */
const PRODUCTS = [
  {
    image: "1.png",
    handle: "flor-de-jamaica",
    title: "Flor de Jamaica",
    subtitle: "Infusión floral",
    price: 12,
  },
  {
    image: "2.png",
    handle: "menta",
    title: "Menta",
    subtitle: "Infusión herbal",
    price: 9,
  },
  {
    image: "3.png",
    handle: "manzanilla",
    title: "Manzanilla",
    subtitle: "Infusión floral",
    price: 10,
  },
  {
    image: "4.png",
    handle: "lavanda",
    title: "Lavanda",
    subtitle: "Infusión floral",
    price: 13,
  },
  {
    image: "5.png",
    handle: "hierba-luisa",
    title: "Hierba Luisa",
    subtitle: "Infusión cítrica",
    price: 11,
  },
  {
    image: "6.png",
    handle: "rosa-frambuesa",
    title: "Rosa & Frambuesa",
    subtitle: "Infusión frutal",
    price: 14,
  },
  {
    image: "7.png",
    handle: "flores-andinas",
    title: "Flores andinas",
    subtitle: "Té de tilo",
    price: 15,
  },
] as const

const IMAGE_DIRECTORY = path.resolve(
  process.cwd(),
  "../storefront/public/serendipity/Catálogo"
)

const productSku = (handle: string) =>
  `SER-${handle.replaceAll("-", "_").toUpperCase()}-CAJA`

export default async function seedSerendipityProducts({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [
    { data: regions },
    { data: salesChannels },
    { data: stockLocations },
    { data: shippingProfiles },
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
      "Ecuador / USD region not found. No products were created."
    )
  }

  const activeSalesChannels = salesChannels.filter(
    (channel) => !channel.is_disabled
  )

  if (activeSalesChannels.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Expected exactly one active sales channel; found ${activeSalesChannels.length}. No products were created.`
    )
  }

  const salesChannel = activeSalesChannels[0]
  const compatibleLocations = stockLocations.filter((location) =>
    location.sales_channels?.some(
      (channel: { id?: string | null } | null) =>
        channel?.id === salesChannel.id
    )
  )

  if (compatibleLocations.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Expected exactly one stock location associated with "${salesChannel.name}"; found ${compatibleLocations.length}. No products were created.`
    )
  }

  if (shippingProfiles.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Expected exactly one shipping profile; found ${shippingProfiles.length}. No products were created.`
    )
  }

  const stockLocation = compatibleLocations[0]
  const shippingProfile = shippingProfiles[0]
  const handles = PRODUCTS.map((product) => product.handle)
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })
  const existingHandles = new Set(
    existingProducts
      .map((product) => product.handle)
      .filter((handle): handle is string => Boolean(handle))
  )

  for (const product of PRODUCTS) {
    if (existingHandles.has(product.handle)) {
      logger.info(`${product.handle}: already exists`)
    }
  }

  const missingProducts = PRODUCTS.filter(
    (product) => !existingHandles.has(product.handle)
  )

  if (!missingProducts.length) {
    logger.info("All seven Serendipity demo products already exist.")
    return
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  })
  const existingCategory = categories.find(
    (item) =>
      item.handle === CATEGORY_HANDLE ||
      item.name?.toLowerCase() === CATEGORY_NAME.toLowerCase()
  )
  let categoryId = existingCategory?.id

  if (!categoryId) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: CATEGORY_NAME,
            handle: CATEGORY_HANDLE,
            is_active: true,
          },
        ],
      },
    })
    categoryId = result[0]?.id
  }

  if (!categoryId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The Infusiones category could not be resolved."
    )
  }

  const imageFiles = await Promise.all(
    missingProducts.map(async (product) => ({
      filename: `serendipity-${product.handle}.png`,
      mimeType: "image/png",
      content: (await readFile(path.join(IMAGE_DIRECTORY, product.image))).toString(
        "base64"
      ),
      access: "public" as const,
    }))
  )
  const { result: uploadedFiles } = await uploadFilesWorkflow(container).run({
    input: { files: imageFiles },
  })

  if (uploadedFiles.length !== missingProducts.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "The File Module did not return one file per missing product."
    )
  }

  const productInputs: CreateProductWorkflowInputDTO[] = missingProducts.map(
    (product, index) => {
      const imageUrl = uploadedFiles[index].url

      return {
        handle: product.handle,
        title: product.title,
        subtitle: product.subtitle,
        description:
          "Producto demo temporal de Serendipity presentado como caja. Descripción comercial pendiente de confirmación.",
        status: ProductStatus.PUBLISHED,
        thumbnail: imageUrl,
        images: [{ url: imageUrl }],
        category_ids: [categoryId],
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: salesChannel.id }],
        options: [
          {
            title: PRESENTATION_OPTION,
            values: [PRESENTATION_VALUE],
            is_exclusive: true,
          },
        ],
        variants: [
          {
            title: PRESENTATION_VALUE,
            sku: productSku(product.handle),
            options: {
              [PRESENTATION_OPTION]: PRESENTATION_VALUE,
            },
            prices: [
              {
                amount: product.price,
                currency_code: "usd",
              },
            ],
            manage_inventory: true,
            allow_backorder: false,
          },
        ],
        metadata: {
          demo: true,
          source_image: product.image,
        },
      }
    }
  )

  await createProductsWorkflow(container).run({
    input: { products: productInputs },
  })

  const skus = missingProducts.map((product) => productSku(product.handle))
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: skus },
  })

  if (inventoryItems.length !== missingProducts.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Expected ${missingProducts.length} inventory items; found ${inventoryItems.length}.`
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

  for (const product of missingProducts) {
    logger.info(`${product.handle}: created`)
  }

  logger.info(
    `Seeded ${missingProducts.length} Serendipity product(s) for Ecuador / USD with ${DEMO_STOCK} demo units each.`
  )
}
