import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const category = product.categories?.[0]

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {category && (
          <LocalizedClientLink
            href={`/categories/${category.handle}`}
            className="type-eyebrow text-serendipity-accent"
          >
            {category.name}
          </LocalizedClientLink>
        )}
        <EditorialHeading
          as="h1"
          size="subsection"
          data-testid="product-title"
        >
          {product.title}
        </EditorialHeading>
        {product.subtitle && (
          <p className="text-base-regular text-serendipity-muted">
            {product.subtitle}
          </p>
        )}
        {product.description && (
          <p
            className="text-base-regular whitespace-pre-line text-serendipity-muted"
            data-testid="product-description"
          >
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
