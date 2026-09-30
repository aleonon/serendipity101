import CtaLink from "@modules/common/components/cta-link"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import SceneRoot from "@modules/design-system/components/scene-root"
import SectionContainer from "@modules/design-system/components/section-container"
import { BLEND_BUILDER_PATH } from "@modules/layout/navigation"

const BlendCTA = () => {
  return (
    <SceneRoot
      scene="blend-cta"
      aria-labelledby="blend-cta-title"
      className="border-b border-serendipity-border bg-serendipity-primary text-serendipity-surface"
    >
      <SectionContainer className="grid gap-8 small:grid-cols-12 small:items-end">
        <div className="small:col-span-8">
          <Eyebrow className="text-serendipity-surface/70">
            Crea tu Serendipity
          </Eyebrow>
          <EditorialHeading
            id="blend-cta-title"
            className="mt-5 text-serendipity-surface"
          >
            Una infusión que sea solamente tuya.
          </EditorialHeading>
          <p className="type-body-large mt-5 max-w-xl text-serendipity-surface/75">
            Combina hojas, flores y frutas. El precio es el de la presentación
            que elijas.
          </p>
        </div>

        <div className="small:col-span-4 small:flex small:justify-end">
          <CtaLink
            href={BLEND_BUILDER_PATH}
            variant="inverse"
            data-testid="blend-cta-link"
          >
            Crear mi mezcla
          </CtaLink>
        </div>
      </SectionContainer>
    </SceneRoot>
  )
}

export default BlendCTA
