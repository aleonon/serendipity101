import type { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL().replace(/\/$/, "")

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/checkout",
        "/*/checkout",
        "/cart",
        "/*/cart",
        "/account",
        "/*/account",
        "/order",
        "/*/order",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
