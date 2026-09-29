import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  deleteProductCategoriesWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Starter clothing categories from Medusa's initial seed. Only these handles
 * are eligible for deletion, and only after we confirm they have no products.
 */
const STARTER_CLOTHING_HANDLES = [
  "shirts",
  "sweatshirts",
  "pants",
  "merch",
] as const

const STARTER_LOCATION_NAME = "European Warehouse"
const SERENDIPITY_LOCATION_NAME = "Serendipity Store"

type CategoryRecord = {
  id: string
  name: string
  handle: string
  parent_category_id?: string | null
  category_children?: { id?: string | null }[] | null
  products?: { id?: string | null }[] | null
}

export default async function cleanupStarterCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: [
      "id",
      "name",
      "handle",
      "parent_category_id",
      "category_children.id",
      "products.id",
    ],
  })

  const removableIds: string[] = []

  for (const category of categories as CategoryRecord[]) {
    if (
      !STARTER_CLOTHING_HANDLES.includes(
        category.handle as (typeof STARTER_CLOTHING_HANDLES)[number]
      )
    ) {
      logger.info(`Keep category ${category.handle} (not starter clothing).`)
      continue
    }

    const productCount = (category.products ?? []).filter(
      (product) => Boolean(product?.id)
    ).length
    const childCount = (category.category_children ?? []).filter(
      (child) => Boolean(child?.id)
    ).length

    if (productCount > 0) {
      logger.info(
        `Skip ${category.handle}: still linked to ${productCount} product(s).`
      )
      continue
    }

    if (childCount > 0) {
      logger.info(
        `Skip ${category.handle}: has ${childCount} child category(ies).`
      )
      continue
    }

    logger.info(`Delete empty starter category ${category.name} / ${category.handle}`)
    removableIds.push(category.id)
  }

  if (removableIds.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: removableIds,
    })
    logger.info(`Deleted ${removableIds.length} starter category(ies).`)
  } else {
    logger.info("No empty starter clothing categories to delete.")
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })

  const alreadyNamed = stockLocations.find(
    (location) => location.name === SERENDIPITY_LOCATION_NAME
  )
  const starterLocation = stockLocations.find(
    (location) => location.name === STARTER_LOCATION_NAME
  )

  if (alreadyNamed) {
    logger.info(
      `Stock location already named "${SERENDIPITY_LOCATION_NAME}"; no duplicate created.`
    )
    return
  }

  if (!starterLocation) {
    logger.info(
      `No stock location named "${STARTER_LOCATION_NAME}"; left existing location(s) unchanged.`
    )
    return
  }

  await updateStockLocationsWorkflow(container).run({
    input: {
      selector: { id: starterLocation.id },
      update: { name: SERENDIPITY_LOCATION_NAME },
    },
  })

  logger.info(
    `Renamed stock location "${STARTER_LOCATION_NAME}" → "${SERENDIPITY_LOCATION_NAME}".`
  )
}
