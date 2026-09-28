import { Metadata } from "next"

import CtaLink from "@modules/common/components/cta-link"
import { CATALOG_PATH } from "@modules/layout/navigation"

export const metadata: Metadata = {
  title: "Crea tu Serendipity | Serendipity",
  description:
    "El creador de mezclas de Serendipity estará disponible próximamente.",
  robots: { index: false, follow: false },
}

/**
 * Placeholder for the Blend Builder. It exists so every "Crear mi mezcla" CTA
 * has a real destination while the builder is not implemented yet.
 */
export default function CreateBlendPage() {
  return (
    <div className="content-container flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-xsmall-regular uppercase tracking-[0.4em] text-serendipity-accent">
        Próximamente
      </p>
      <h1 className="mt-6 max-w-2xl font-display text-3xl leading-tight text-serendipity-primary small:text-[2.75rem]">
        Crea una infusión que sea solamente tuya.
      </h1>
      <p className="text-large-regular mt-6 max-w-xl leading-8 text-serendipity-muted">
        Todavía estamos construyendo el creador de mezclas. Mientras tanto,
        puedes explorar el catálogo completo.
      </p>
      <CtaLink href={CATALOG_PATH} className="mt-10">
        Ver el catálogo
      </CtaLink>
    </div>
  )
}
