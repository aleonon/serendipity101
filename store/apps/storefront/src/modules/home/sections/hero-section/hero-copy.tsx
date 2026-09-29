import CtaLink from "@modules/common/components/cta-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import { BLEND_BUILDER_PATH, CATALOG_PATH } from "@modules/layout/navigation"

const HeroCopy = () => {
  return (
    <div className="max-w-2xl">
      <Eyebrow>Serendipity</Eyebrow>

      <EditorialHeading as="h1" size="hero" id="hero-title" className="mt-8">
        Una pausa encontrada por casualidad.
      </EditorialHeading>

      <p className="type-body-large mt-8 max-w-xl text-serendipity-muted">
        Tés de especialidad, botánicos e infusiones creadas para encontrar algo
        distinto en cada taza.
      </p>

      <div className="mt-12 flex flex-col gap-4 xsmall:flex-row">
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
