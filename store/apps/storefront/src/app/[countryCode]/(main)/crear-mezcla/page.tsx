import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getBlendCatalog } from "@lib/data/blends"
import { getRegion } from "@lib/data/regions"
import CtaLink from "@modules/common/components/cta-link"
import BlendBuilder from "@modules/blend/blend-builder"
import { CATALOG_PATH } from "@modules/layout/navigation"

export const metadata: Metadata = {
  title: "Crea tu infusión | Serendipity",
  description:
    "Arma una mezcla con las bases y los botánicos del catálogo de Serendipity.",
}

export default async function CreateBlendPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const catalog = await getBlendCatalog(region.currency_code)

  if (!catalog.available) {
    return (
      <div className="content-container flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="type-eyebrow text-serendipity-accent">Mezcla personalizada</p>
        <h1 className="mt-6 max-w-2xl font-display text-3xl leading-tight text-serendipity-primary small:text-[2.75rem]">
          La mezcla personalizada no está disponible en este momento.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-serendipity-muted">
          Puedes seguir explorando las infusiones del catálogo.
        </p>
        <CtaLink href={CATALOG_PATH} className="mt-10">
          Ver el catálogo
        </CtaLink>
      </div>
    )
  }

  return (
    <div className="content-container py-section-compact">
      <BlendBuilder catalog={catalog} countryCode={countryCode} />
    </div>
  )
}
