import BotanicalMark from "@modules/common/components/botanical-mark"
import CtaLink from "@modules/common/components/cta-link"
import { BLEND_BUILDER_PATH, CATALOG_PATH } from "@modules/layout/navigation"
import Image from "next/image"

const HERO_IMAGE = "/serendipity/Catálogo/7.png"

const HeroSection = () => {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-serendipity-border"
    >
      <BotanicalMark
        className="pointer-events-none absolute -left-10 top-10 h-64 w-32 opacity-30 small:h-96 small:w-48"
      />

      <div className="content-container relative grid items-center gap-12 py-16 small:grid-cols-[55fr_45fr] small:gap-20 small:py-28">
        <div className="max-w-2xl">
          <p className="text-xsmall-regular uppercase tracking-[0.4em] text-serendipity-accent">
            Serendipity
          </p>

          <h1
            id="hero-title"
            className="mt-8 font-display text-[2.75rem] leading-[1.05] text-serendipity-primary xsmall:text-[3.25rem] small:text-[4.25rem]"
          >
            Una pausa encontrada por casualidad.
          </h1>

          <p className="text-large-regular mt-8 max-w-xl leading-8 text-serendipity-muted">
            Tés de especialidad, botánicos e infusiones creadas para encontrar
            algo distinto en cada taza.
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

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-5 -top-5 hidden h-full w-full rounded-large border border-serendipity-border small:block"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-large border border-serendipity-border bg-serendipity-surface">
            <Image
              src={HERO_IMAGE}
              alt="Caja de Flores andinas, té de tilo de Serendipity"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
