import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import ProductCard from "@modules/products/components/product-card"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {
    is_giftcard: false,
  }

  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  } else {
    const categoryId = product.categories?.[0]?.id
    if (categoryId) {
      queryParams.category_id = [categoryId]
    }
  }

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) =>
    response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  )

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="mb-16 flex flex-col items-center text-center">
        <Eyebrow className="mb-6">También en Serendipity</Eyebrow>
        <EditorialHeading className="max-w-lg">
          Otras infusiones para explorar.
        </EditorialHeading>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4">
        {products.map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <ProductCard product={relatedProduct} />
          </li>
        ))}
      </ul>
    </div>
  )
}
