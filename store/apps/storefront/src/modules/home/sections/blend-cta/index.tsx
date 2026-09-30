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
      className="border-b border-serendipity-border"
    >
      <SectionContainer>
        <div className="grid overflow-hidden bg-serendipity-primary text-serendipity-surface small:grid-cols-12">
          <div className="relative px-7 py-12 small:col-span-7 small:px-12 small:py-16">
            <BotanicalMark className="pointer-events-none absolute -left-6 top-8 h-40 w-20 text-serendipity-surface/15" />
            <Eyebrow className="relative text-serendipity-cream">
              Crea tu Serendipity
            </Eyebrow>
            <EditorialHeading
              id="blend-cta-title"
              className="relative mt-6 text-serendipity-surface"
            >
              Crea una infusión que sea solamente tuya.
            </EditorialHeading>
            <p className="type-body-large relative mt-6 max-w-xl text-serendipity-surface/80">
              Combina hojas, flores y frutas hasta encontrar una mezcla que no
              exista en ningún otro lugar.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-10 bg-serendipity-cream px-7 py-10 text-serendipity-ink small:col-span-5 small:px-10 small:py-14">
            <div>
              <p className="font-display text-5xl leading-none text-serendipity-primary">
                Tu mezcla.
              </p>
              <span className="mt-6 block h-px w-14 bg-serendipity-rose" />
              <p className="text-base-regular mt-6 max-w-xs leading-7 text-serendipity-muted">
                Precio según la presentación
              </p>
            </div>
            <CtaLink
              href={BLEND_BUILDER_PATH}
              data-testid="blend-cta-link"
            >
              Crear mi mezcla
            </CtaLink>
          </div>
        </div>
      </SectionContainer>
    </SceneRoot>
  )
}

export default BlendCTA
