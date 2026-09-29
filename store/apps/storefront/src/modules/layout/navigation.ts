import { listCategories } from "@lib/data/categories"

/**
 * Placeholder route for the Blend Builder. The builder itself is not implemented
 * yet, so the page only announces it. Keeping the path here means the future
 * implementation can move the route without touching every CTA.
 */
export const BLEND_BUILDER_PATH = "/crear-mezcla"

export const CATALOG_PATH = "/store"

export const INFUSIONES_CATEGORY_HANDLE = "infusiones"

export type NavLink = {
  label: string
  href: string
}

/**
 * Product category handles we want in the main navigation, in display order.
 * Only the ones that actually exist in Medusa are rendered, so the navigation
 * never links to a category route that would 404.
 */
const CURATED_CATEGORY_HANDLES = [
  "tes",
  INFUSIONES_CATEGORY_HANDLE,
  "botanicos",
]

export const listNavigationLinks = async (): Promise<NavLink[]> => {
  const categories = await listCategories({ fields: "id,name,handle" })

  const categoriesByHandle = new Map(
    (categories ?? []).map((category) => [category.handle, category])
  )

  const categoryLinks = CURATED_CATEGORY_HANDLES.flatMap((handle) => {
    const category = categoriesByHandle.get(handle)

    return category
      ? [{ label: category.name, href: `/categories/${category.handle}` }]
      : []
  })

  return [
    { label: "Catálogo", href: CATALOG_PATH },
    ...categoryLinks,
    { label: "Crea tu mezcla", href: BLEND_BUILDER_PATH },
  ]
}
