import type { MetadataRoute } from "next"

import { BLEND_PRODUCT_HANDLE } from "@lib/blend/product"
import { getBaseURL } from "@lib/util/env"
import { storefrontCountryCode } from "@lib/util/storefront-countries"

type StoreRegionList = {
  regions: Array<{
    countries?: Array<{ iso_2?: string | null }> | null
  }>
}

type StoreProductList = {
  products: Array<{ handle?: string | null }>
}

const STATIC_PATHS = ["", "/store", "/crear-mezcla"] as const

function backendUrl() {
  return (
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  ).replace(/\/$/, "")
}

async function fetchStore<T>(path: string, query?: Record<string, string>) {
  const url = new URL(path, `${backendUrl()}/`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }
  }

  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const response = await fetch(url, {
    headers: publishableKey
      ? { "x-publishable-api-key": publishableKey }
      : undefined,
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL().replace(/\/$/, "")

  try {
    const { regions } = await fetchStore<StoreRegionList>("/store/regions")
    const countries = regions
      .flatMap(
        (region) =>
          region.countries
            ?.map((country) => country.iso_2)
            .filter((code): code is string => Boolean(code)) ?? []
      )
      .filter((code) => code.toLowerCase() === storefrontCountryCode)
    const { products } = await fetchStore<StoreProductList>("/store/products", {
      limit: "100",
      fields: "handle",
    })

    const entries: MetadataRoute.Sitemap = []

    for (const country of countries) {
      for (const path of STATIC_PATHS) {
        entries.push({
          url: `${base}/${country}${path}`,
          changeFrequency: "weekly",
          priority: path === "" ? 1 : 0.8,
        })
      }

      for (const product of products) {
        if (!product.handle || product.handle === BLEND_PRODUCT_HANDLE) {
          continue
        }

        entries.push({
          url: `${base}/${country}/products/${product.handle}`,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }

    return entries.length > 0 ? entries : [{ url: base }]
  } catch {
    return [{ url: base }]
  }
}
