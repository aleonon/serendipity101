import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ProductCardView from "@modules/design-system/components/product-card-view"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  /** Set on above-the-fold cards only. */
  priority?: boolean
  featured?: boolean
}

/**
 * Commerce presentation of a single product. It depends exclusively on the
 * product data, so it can be reused by any listing (home, category, search) and
 * later wrapped by an animation component without changing this file.
 */
const ProductCard = ({
  product,
  priority = false,
  featured = false,
}: ProductCardProps) => {
  const { cheapestPrice } = getProductPrice({ product })
  const image = product.thumbnail ?? product.images?.[0]?.url

  return (
    <ProductCardView
      href={`/products/${product.handle}`}
      image={image ?? undefined}
      imageAlt={`Caja de ${product.title}`}
      title={product.title}
      subtitle={product.subtitle}
      price={cheapestPrice?.calculated_price}
      priority={priority}
      featured={featured}
    />
  )
}

export default ProductCard
