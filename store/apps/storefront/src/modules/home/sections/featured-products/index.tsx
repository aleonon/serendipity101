import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CATALOG_PATH } from "@modules/layout/navigation"
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
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: FEATURED_LIMIT, order: "title" },
  })

  if (!products.length) {
    return null
  }

  return (
    <section
      aria-labelledby="featured-products-title"
      className="border-b border-serendipity-border"
    >
      <div className="content-container py-20 small:py-32">
        <div className="flex flex-col gap-6 xsmall:flex-row xsmall:items-end xsmall:justify-between">
          <div>
            <p className="text-xsmall-regular uppercase tracking-[0.4em] text-serendipity-accent">
              Selección
            </p>
            <h2
              id="featured-products-title"
              className="mt-6 font-display text-3xl leading-tight text-serendipity-primary small:text-[2.75rem]"
            >
              Para empezar por algún lugar.
            </h2>
          </div>

          <LocalizedClientLink
            href={CATALOG_PATH}
            className="text-base-regular border-b border-serendipity-primary/40 pb-1 text-serendipity-primary transition-colors duration-300 hover:border-serendipity-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serendipity-primary focus-visible:ring-offset-2 focus-visible:ring-offset-serendipity-bg"
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
      </div>
    </section>
  )
}

export default FeaturedProducts
