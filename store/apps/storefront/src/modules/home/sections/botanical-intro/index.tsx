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
    <section
      aria-labelledby="botanical-intro-title"
      className="border-b border-serendipity-border"
    >
      <div className="content-container grid gap-12 py-20 small:grid-cols-12 small:gap-x-16 small:py-32">
        <div className="small:col-span-4">
          <p className="text-xsmall-regular uppercase tracking-[0.4em] text-serendipity-accent">
            Botánica
          </p>
          <h2
            id="botanical-intro-title"
            className="mt-6 font-display text-3xl leading-tight text-serendipity-primary small:text-[2.75rem]"
          >
            Tres familias, infinitas combinaciones.
          </h2>
        </div>

        <ul className="small:col-span-7 small:col-start-6 flex flex-col gap-10 small:gap-0">
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
                <h3 className="font-display text-2xl text-serendipity-primary small:text-3xl">
                  {ingredient.title}
                </h3>
              </div>
              <p className="text-base-regular mt-3 max-w-md pl-12 leading-7 text-serendipity-muted">
                {ingredient.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default BotanicalIntro
