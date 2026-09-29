import { Parallax, Reveal, ScrollScene } from "@modules/animation"
import BotanicalLeaf from "@modules/design-system/components/botanical-leaf"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import Eyebrow from "@modules/design-system/components/eyebrow"
import SceneRoot from "@modules/design-system/components/scene-root"
import SectionContainer from "@modules/design-system/components/section-container"

const INGREDIENTS = [
  {
    index: "01",
    title: "Hojas",
    description:
      "La base de toda taza. Hojas para infusionar, sueltas o en sobres.",
    offset: "small:mt-0 small:w-[92%]",
  },
  {
    index: "02",
    title: "Flores",
    description: "Lo que abre el aroma antes del primer sorbo.",
    offset: "small:mt-14 small:ml-auto small:w-[84%]",
  },
  {
    index: "03",
    title: "Frutas",
    description: "El contraste: acidez y dulzor para cerrar la mezcla.",
    offset: "small:mt-14 small:w-[76%]",
  },
]

const BotanicalIntro = () => {
  return (
    <SceneRoot
      scene="botanical-intro"
      aria-labelledby="botanical-intro-title"
      className="border-b border-serendipity-border"
    >
      <ScrollScene>
        <SectionContainer className="grid gap-12 small:grid-cols-12 small:gap-x-16">
          <Reveal className="small:col-span-4">
            <div className="flex items-center gap-3">
              <Eyebrow>Botánica</Eyebrow>
              <Parallax distance={12}>
                <BotanicalLeaf />
              </Parallax>
            </div>
            <EditorialHeading id="botanical-intro-title" className="mt-6">
              Tres familias, infinitas combinaciones.
            </EditorialHeading>
          </Reveal>

          <Reveal className="small:col-span-7 small:col-start-6" delay={0.08}>
            <ul className="flex flex-col gap-10 small:gap-0">
              {INGREDIENTS.map((ingredient) => (
                <li
                  key={ingredient.index}
                  className={`border-t border-serendipity-border pt-6 small:pt-10 ${ingredient.offset}`}
                >
                  <div className="flex items-baseline gap-6">
                    <span
                      aria-hidden="true"
                      className="text-xsmall-regular tabular-nums text-serendipity-sage"
                    >
                      {ingredient.index}
                    </span>
                    <EditorialHeading as="h3" size="subsection">
                      {ingredient.title}
                    </EditorialHeading>
                  </div>
                  <p className="text-base-regular mt-3 max-w-md pl-12 leading-7 text-serendipity-muted">
                    {ingredient.description}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </SectionContainer>
      </ScrollScene>
    </SceneRoot>
  )
}

export default BotanicalIntro
