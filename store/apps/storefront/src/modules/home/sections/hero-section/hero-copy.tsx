import CtaLink from "@modules/common/components/cta-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import { BLEND_BUILDER_PATH, CATALOG_PATH } from "@modules/layout/navigation"

const HeroCopy = () => {
  return (
    <div className="max-w-3xl">
      <Eyebrow>Serendipity</Eyebrow>
      <span className="mt-5 block h-px w-14 bg-serendipity-accent" />

      <EditorialHeading as="h1" size="hero" id="hero-title" className="mt-7">
        Una pausa encontrada por casualidad.
      </EditorialHeading>

      <p className="type-body-large mt-8 max-w-md text-serendipity-ink/80">
        Tés de especialidad, botánicos e infusiones creadas para encontrar algo
        distinto en cada taza.
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
