import CtaLink from "@modules/common/components/cta-link"
import BotanicalMark from "@modules/design-system/components/botanical-mark"
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
      <SectionContainer className="relative grid gap-10 small:grid-cols-12 small:items-center">
        <BotanicalMark
          className="pointer-events-none absolute right-0 top-1/2 hidden h-64 w-32 -translate-y-1/2 text-serendipity-surface/25 small:block"
        />

        <div className="small:col-span-7">
          <Eyebrow className="text-serendipity-surface/70">
            Crea tu Serendipity
          </Eyebrow>
          <EditorialHeading
            id="blend-cta-title"
            className="mt-6 text-serendipity-surface"
          >
            Crea una infusión que sea solamente tuya.
          </EditorialHeading>
          <p className="type-body-large mt-6 max-w-xl text-serendipity-surface/80">
            Combina hojas, flores y frutas hasta encontrar una mezcla que no
            exista en ningún otro lugar.
          </p>
        </div>

        <div className="small:col-span-4 small:col-start-9">
          <CtaLink
            href={BLEND_BUILDER_PATH}
            variant="inverse"
            data-testid="blend-cta-link"
          >
            Crear mi mezcla
          </CtaLink>
          <p className="text-xsmall-regular mt-4 uppercase tracking-[0.2em] text-serendipity-surface/60">
            Precio según la presentación
          </p>
        </div>
      </SectionContainer>
    </SceneRoot>
  )
}

export default BlendCTA
