import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  /** Set on above-the-fold cards only. */
  priority?: boolean
}

/**
 * Commerce presentation of a single product. It depends exclusively on the
 * product data, so it can be reused by any listing (home, category, search) and
 * later wrapped by an animation component without changing this file.
 */
const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const { cheapestPrice } = getProductPrice({ product })
  const image = product.thumbnail ?? product.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block rounded-large focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serendipity-primary focus-visible:ring-offset-4 focus-visible:ring-offset-serendipity-bg"
      data-testid="product-card"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-large border border-serendipity-border bg-serendipity-surface">
          {image ? (
            <Image
              src={image}
              alt={`Caja de ${product.title}`}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-serendipity-muted">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>

        <h3
          className="mt-5 font-display text-xl leading-tight text-serendipity-primary"
          data-testid="product-title"
        >
          {product.title}
        </h3>

        {product.subtitle && (
          <p className="text-small-regular mt-1 text-serendipity-muted">
            {product.subtitle}
          </p>
        )}

        {cheapestPrice && (
          <p
            className="text-base-regular mt-3 tabular-nums text-serendipity-ink"
            data-testid="product-price"
          >
            {cheapestPrice.calculated_price}
          </p>
        )}
      </article>
    </LocalizedClientLink>
  )
}

export default ProductCard
