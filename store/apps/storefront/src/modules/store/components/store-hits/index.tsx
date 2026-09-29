"use client"

import type { Hit } from "instantsearch.js"
import { useEffect, useRef } from "react"
import { useHits, useInstantSearch } from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import { indexedCurrency, priceAttribute } from "@lib/search-client"
import { convertToLocale } from "@lib/util/money"
import ProductCardView from "@modules/design-system/components/product-card-view"
import { Text } from "@modules/common/components/ui"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchPagination from "./pagination"
import type { HitPricing } from "./price"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
    category?: string[]
  } & HitPricing
>

type StoreHitsProps = {
  hitsPerPage: number
  currencyCode: string
}

const formattedPrice = (hit: HitPricing, currencyCode: string) => {
  const value = hit[priceAttribute("min_price", currencyCode)]
  if (typeof value !== "number") {
    return undefined
  }

  return convertToLocale({
    amount: value,
    currency_code: indexedCurrency(currencyCode),
  })
}

const StoreHits = ({ hitsPerPage, currencyCode }: StoreHitsProps) => {
  const { items } = useHits<ProductHit>()
  const { status, error, indexUiState } = useInstantSearch()
  const { isSearching, hasNoResultsYet } = useSearchSettled()

  const { page, ...refinements } = indexUiState
  const currentPage = page ?? 1
  const refinementKey = JSON.stringify(refinements)

  const settled = useRef({ page: currentPage, refinementKey })

  useEffect(() => {
    if (!isSearching) {
      settled.current = { page: currentPage, refinementKey }
    }
  }, [isSearching, currentPage, refinementKey])

  const isPagingOnly =
    refinementKey === settled.current.refinementKey &&
    currentPage !== settled.current.page

  const showSkeleton = hasNoResultsYet || (isSearching && isPagingOnly)

  if (status === "error") {
    return (
      <Text
        className="py-16 text-center text-serendipity-muted"
        data-testid="products-error"
      >
        No se pudieron cargar los productos
        {error?.message ? `: ${error.message}` : "."}
      </Text>
    )
  }

  return (
    <>
      {showSkeleton ? (
        <SkeletonProductGrid numberOfProducts={hitsPerPage} />
      ) : !items.length ? (
        <Text
          className="py-16 text-center text-serendipity-muted"
          data-testid="no-products"
        >
          No hay productos con estos filtros.
        </Text>
      ) : (
        <ul
          className="grid w-full grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4"
          data-testid="products-list"
        >
          {items.map((hit) =>
            hit.handle ? (
              <li key={hit.objectID}>
                <ProductCardView
                  href={`/products/${hit.handle}`}
                  image={hit.thumbnail ?? undefined}
                  imageAlt={`Caja de ${hit.title ?? hit.handle}`}
                  title={hit.title ?? hit.handle}
                  subtitle={hit.category?.[0]}
                  price={formattedPrice(hit, currencyCode)}
                />
              </li>
            ) : null
          )}
        </ul>
      )}
      <SearchPagination />
    </>
  )
}

export default StoreHits
