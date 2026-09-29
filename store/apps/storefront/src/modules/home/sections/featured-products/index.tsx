import { getCategoryIdByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import SceneRoot from "@modules/design-system/components/scene-root"
import SectionContainer from "@modules/design-system/components/section-container"
import {
  CATALOG_PATH,
  INFUSIONES_CATEGORY_HANDLE,
} from "@modules/layout/navigation"
import ProductCard from "@modules/products/components/product-card"

const FEATURED_LIMIT = 4

type FeaturedProductsProps = {
  countryCode: string
}

/**
 * Reuses the storefront's existing product fetching layer, so the home page
 * shows the same Medusa data (region, prices, availability) as every listing.
 */
const FeaturedProducts = async ({ countryCode }: FeaturedProductsProps) => {
  const infusionsCategoryId = await getCategoryIdByHandle(
    INFUSIONES_CATEGORY_HANDLE
  )

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: FEATURED_LIMIT,
      order: "title",
      ...(infusionsCategoryId ? { category_id: [infusionsCategoryId] } : {}),
    },
  })

  if (!products.length) {
    return null
  }

  return (
    <SceneRoot
      scene="featured-products"
      aria-labelledby="featured-products-title"
      className="border-b border-serendipity-border"
    >
      <SectionContainer>
        <div className="flex flex-col gap-6 xsmall:flex-row xsmall:items-end xsmall:justify-between">
          <div>
            <Eyebrow>Selección</Eyebrow>
            <EditorialHeading
              id="featured-products-title"
              className="mt-6"
            >
              Para empezar por algún lugar.
            </EditorialHeading>
          </div>

          <LocalizedClientLink
            href={CATALOG_PATH}
            className="serendipity-text-link text-base-regular"
            data-testid="featured-products-all-link"
          >
            Ver todo el catálogo
          </LocalizedClientLink>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 small:grid-cols-4 small:gap-x-8">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 2} />
            </li>
          ))}
        </ul>
      </SectionContainer>
    </SceneRoot>
  )
}

export default FeaturedProducts
