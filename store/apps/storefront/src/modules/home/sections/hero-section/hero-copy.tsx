import CtaLink from "@modules/common/components/cta-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import { BLEND_BUILDER_PATH, CATALOG_PATH } from "@modules/layout/navigation"

const HeroCopy = () => {
  return (
    <div className="max-w-xl">
      <Eyebrow>Serendipity</Eyebrow>

      <EditorialHeading as="h1" size="hero" id="hero-title" className="mt-6">
        Cada taza abre una pausa distinta.
      </EditorialHeading>

      <p className="type-body-large mt-8 max-w-md text-serendipity-muted">
        Flores, hojas y fruta, reunidas para un momento propio.
      </p>

      <div className="mt-10 flex flex-col gap-3 xsmall:flex-row">
        <CtaLink href={CATALOG_PATH} data-testid="hero-catalog-cta">
          Descubrir tés
        </CtaLink>
        <CtaLink
          href={BLEND_BUILDER_PATH}
          variant="secondary"
          data-testid="hero-blend-cta"
        >
          Crear mi mezcla
        </CtaLink>
      </div>
    </div>
  )
}

export default HeroCopy
