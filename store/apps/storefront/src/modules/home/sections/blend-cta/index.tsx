import BotanicalMark from "@modules/common/components/botanical-mark"
import CtaLink from "@modules/common/components/cta-link"
import { BLEND_BUILDER_PATH } from "@modules/layout/navigation"

const BlendCta = () => {
  return (
    <section
      aria-labelledby="blend-cta-title"
      className="border-b border-serendipity-border bg-serendipity-primary text-serendipity-surface"
    >
      <div className="content-container relative grid gap-10 py-20 small:grid-cols-12 small:items-center small:py-32">
        <BotanicalMark
          className="pointer-events-none absolute right-0 top-1/2 hidden h-64 w-32 -translate-y-1/2 text-serendipity-surface/25 small:block"
        />

        <div className="small:col-span-7">
          <p className="text-xsmall-regular uppercase tracking-[0.4em] text-serendipity-surface/70">
            Crea tu Serendipity
          </p>
          <h2
            id="blend-cta-title"
            className="mt-6 font-display text-3xl leading-tight small:text-[2.75rem]"
          >
            Crea una infusión que sea solamente tuya.
          </h2>
          <p className="text-large-regular mt-6 max-w-xl leading-8 text-serendipity-surface/80">
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
            Próximamente
          </p>
        </div>
      </div>
    </section>
  )
}

export default BlendCta
