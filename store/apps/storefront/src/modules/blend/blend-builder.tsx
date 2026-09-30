"use client"

import { addBlendToCart } from "@lib/data/blends"
import {
  previewComposition,
  sanitizeBlendName,
} from "@lib/blend/composition"
import type {
  BlendCatalog,
  BlendCatalogIngredient,
  BlendCategory,
} from "@lib/blend/types"
import { convertToLocale } from "@lib/util/money"
import BlendPreview from "@modules/blend/blend-preview"
import { getButtonClasses } from "@modules/design-system/styles/button"
import { clx } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useEffect, useId, useState } from "react"
import Image from "next/image"

const STEPS = [
  { id: "base", label: "Base" },
  { id: "leaf", label: "Hojas" },
  { id: "flower", label: "Flores" },
  { id: "fruit", label: "Frutas" },
  { id: "size", label: "Presentación" },
  { id: "review", label: "Revisión" },
] as const

const STEP_COPY: Record<
  (typeof STEPS)[number]["id"],
  { title: string; body: string }
> = {
  base: {
    title: "Elige la base",
    body: "Solo los estilos que ya viven en el catálogo. No hay té negro, verde ni oolong en la tienda.",
  },
  leaf: {
    title: "Hojas y botánicos",
    body: "Puedes elegir varios. El orden en que los tocas define cómo se reparte la mezcla.",
  },
  flower: {
    title: "Flores",
    body: "Las flores que ya están en el catálogo. Si no eliges ninguna, puedes seguir.",
  },
  fruit: {
    title: "Frutas",
    body: "Nada inventado: si la tienda no tiene una fruta, este paso queda en calma.",
  },
  size: {
    title: "Presentación",
    body: "El precio es el de la variante. En esta versión la receta no cambia el precio.",
  },
  review: {
    title: "Tu receta",
    body: "Las proporciones son partes enteras de 100. Primero la base, después los ingredientes en el orden elegido. Las primeras partes absorben el residuo. Para cambiar una mezcla que ya está en el carrito, quítala y créala de nuevo.",
  },
}

const MAX_INGREDIENTS = 6

type BlendBuilderProps = {
  catalog: BlendCatalog
  countryCode: string
}

const BlendBuilder = ({ catalog, countryCode }: BlendBuilderProps) => {
  const router = useRouter()
  const nameId = useId()
  const [step, setStep] = useState(0)
  const [baseId, setBaseId] = useState<string | null>(null)
  const [ingredientIds, setIngredientIds] = useState<string[]>([])
  const [variantId, setVariantId] = useState<string | null>(null)
  const [blendName, setBlendName] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const base = catalog.bases.find((item) => item.id === baseId) ?? null
  const selectedIngredients = ingredientIds
    .map((id) => catalog.ingredients.find((item) => item.id === id))
    .filter((item): item is BlendCatalogIngredient => Boolean(item))
  const presentation =
    catalog.presentations.find((item) => item.variant_id === variantId) ?? null
  const composition = previewComposition(selectedIngredients.length)
  const current = STEPS[step] ?? STEPS[0]
  const copy = STEP_COPY[current.id]

  useEffect(() => {
    document
      .querySelector('[aria-current="step"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [step])

  const toggleIngredient = (id: string) => {
    setIngredientIds((currentIds) => {
      if (currentIds.includes(id)) {
        return currentIds.filter((item) => item !== id)
      }

      if (currentIds.length >= MAX_INGREDIENTS) {
        return currentIds
      }

      return [...currentIds, id]
    })
  }

  const canReach = (index: number) => {
    if (index <= 0) {
      return true
    }

    if (!baseId) {
      return false
    }

    if (index <= 3) {
      return true
    }

    if (selectedIngredients.length < 1) {
      return false
    }

    if (index === 4) {
      return true
    }

    return Boolean(variantId)
  }

  const continueDisabled =
    (current.id === "base" && !baseId) ||
    (current.id === "fruit" && selectedIngredients.length < 1) ||
    (current.id === "size" && !variantId) ||
    (current.id === "review" &&
      (!baseId || !variantId || selectedIngredients.length < 1))

  const goNext = () => {
    if (continueDisabled) {
      return
    }

    if (current.id === "review") {
      void confirm()
      return
    }

    setStep((value) => Math.min(value + 1, STEPS.length - 1))
  }

  const confirm = async () => {
    if (!baseId || !variantId || selectedIngredients.length < 1 || pending) {
      return
    }

    setPending(true)
    setError(null)

    const result = await addBlendToCart({
      countryCode,
      variantId,
      baseId,
      ingredientIds: selectedIngredients.map((item) => item.id),
      blendName,
    })

    if (!result.ok) {
      setError(result.message)
      setPending(false)
      return
    }

    router.push(`/${countryCode}/cart`)
    router.refresh()
  }

  const actionLabel =
    current.id === "review"
      ? pending
        ? "Añadiendo…"
        : "Añadir al carrito"
      : "Continuar"

  const summaryBits = [
    base?.name ?? null,
    selectedIngredients.length
      ? `${selectedIngredients.length} ${selectedIngredients.length === 1 ? "ingrediente" : "ingredientes"}`
      : null,
    presentation?.title ?? null,
  ].filter((item): item is string => Boolean(item))

  return (
    <div className="pb-40 small:pb-0">
      <div className="max-w-xl">
        <p className="type-eyebrow text-serendipity-accent">Mezcla personalizada</p>
        <h1 className="type-display-section mt-4 text-serendipity-primary">
          Crea tu infusión
        </h1>
        <p className="mt-4 text-base leading-7 text-serendipity-muted">
          Una receta, guardada con la presentación que elijas. El precio es el
          de esa presentación.
        </p>
      </div>

      <div className="mt-10 small:grid small:grid-cols-[minmax(0,1fr)_20rem] small:items-start small:gap-16">
        <div>
          <div className="mb-8 small:hidden">
            <BlendPreview base={base} ingredients={selectedIngredients} />
          </div>

          <ol
            aria-label="Pasos de la mezcla"
            className="flex gap-2 overflow-x-auto pb-2"
          >
            {STEPS.map((item, index) => {
              const reachable = canReach(index)

              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={index === step ? "step" : undefined}
                    disabled={!reachable}
                    onClick={() => reachable && setStep(index)}
                    className={clx(
                      "min-h-11 rounded-circle px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serendipity-primary focus-visible:ring-offset-2 focus-visible:ring-offset-serendipity-bg disabled:opacity-40",
                      index === step
                        ? "bg-serendipity-primary text-serendipity-surface"
                        : "bg-serendipity-sage-soft text-serendipity-primary"
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ol>

          <section className="mt-8" aria-labelledby="blend-step-title">
            <h2
              id="blend-step-title"
              tabIndex={-1}
              className="font-display text-3xl text-serendipity-primary focus:outline-none"
            >
              {copy.title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-serendipity-muted">
              {copy.body}
            </p>

            <div className="mt-8">
              {current.id === "base" ? (
                <OptionList
                  label="Bases"
                  options={catalog.bases.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    image: null,
                  }))}
                  selected={[baseId].filter((id): id is string => Boolean(id))}
                  onToggle={(id) => setBaseId(id)}
                />
              ) : null}

              {current.id === "leaf" ||
              current.id === "flower" ||
              current.id === "fruit" ? (
                <IngredientStep
                  category={current.id}
                  ingredients={catalog.ingredients}
                  selectedIds={ingredientIds}
                  onToggle={toggleIngredient}
                />
              ) : null}

              {current.id === "size" ? (
                <ul className="grid gap-3" aria-label="Presentaciones">
                  {catalog.presentations.map((item) => {
                    const selected = item.variant_id === variantId
                    const price =
                      item.amount === null
                        ? "Precio al confirmar"
                        : convertToLocale({
                            amount: item.amount,
                            currency_code: item.currency_code,
                          })

                    return (
                      <li key={item.variant_id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          data-testid="blend-variant"
                          onClick={() => setVariantId(item.variant_id)}
                          className={optionClass(selected)}
                        >
                          <span className="block font-medium text-serendipity-primary">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-sm text-serendipity-muted">
                            {price}
                          </span>
                          {selected ? (
                            <span className="mt-2 block text-sm text-serendipity-accent">
                              Elegida
                            </span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}

              {current.id === "review" && composition ? (
                <div className="space-y-8">
                  <div>
                    <label
                      htmlFor={nameId}
                      className="text-sm text-serendipity-muted"
                    >
                      Nombre de la mezcla
                    </label>
                    <input
                      id={nameId}
                      value={blendName}
                      maxLength={40}
                      onChange={(event) => setBlendName(event.target.value)}
                      placeholder="Mi Serendipity"
                      className="mt-2 w-full rounded-large border border-serendipity-border bg-serendipity-surface px-4 py-3 text-serendipity-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serendipity-primary"
                    />
                    <p className="mt-2 text-sm text-serendipity-muted">
                      Se guardará como {sanitizeBlendName(blendName)}.
                    </p>
                  </div>
                  <div data-testid="blend-review">
                    <p className="text-serendipity-muted">Base:</p>
                    <p className="mt-1 text-serendipity-ink">
                      {base?.name} {composition.base}%
                    </p>
                    <p className="mt-4 text-serendipity-muted">Ingredientes:</p>
                    <ul className="mt-1 space-y-1">
                      {selectedIngredients.map((ingredient, index) => (
                        <li key={ingredient.id}>
                          {ingredient.name} {composition.ingredients[index]}%
                        </li>
                      ))}
                    </ul>
                    {presentation ? (
                      <p className="mt-4 text-serendipity-ink">
                        {presentation.title}
                        {presentation.amount !== null
                          ? ` · ${convertToLocale({
                              amount: presentation.amount,
                              currency_code: presentation.currency_code,
                            })}`
                          : null}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {error ? (
            <p role="alert" className="mt-6 text-sm text-serendipity-accent">
              {error}
            </p>
          ) : null}

          <div className="mt-8 hidden items-center gap-3 small:flex">
            {step > 0 ? (
              <button
                type="button"
                className={getButtonClasses("secondary")}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                Atrás
              </button>
            ) : null}
            <button
              type="button"
              className={getButtonClasses("primary")}
              disabled={continueDisabled || pending}
              aria-busy={pending}
              data-testid="blend-next"
              onClick={goNext}
            >
              {actionLabel}
            </button>
          </div>
        </div>

        <aside className="sticky top-24 hidden small:block">
          <BlendPreview base={base} ingredients={selectedIngredients} />
          <p className="mt-4 text-sm text-serendipity-muted">
            {summaryBits.join(" · ") || "Elige una base para empezar."}
          </p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-serendipity-border bg-serendipity-bg/95 px-gutter py-3 backdrop-blur-sm small:hidden">
        <p className="truncate text-sm text-serendipity-muted">
          {summaryBits.join(" · ") || copy.title}
        </p>
        <div className="mt-2 flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              className={getButtonClasses("secondary", "flex-1")}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Atrás
            </button>
          ) : null}
          <button
            type="button"
            className={getButtonClasses("primary", "flex-1")}
            disabled={continueDisabled || pending}
            aria-busy={pending}
            data-testid="blend-next-mobile"
            onClick={goNext}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const optionClass = (selected: boolean) =>
  clx(
    "w-full scroll-mb-36 rounded-large border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-serendipity-primary focus-visible:ring-offset-2 focus-visible:ring-offset-serendipity-bg disabled:opacity-40",
    selected
      ? "border-serendipity-primary bg-serendipity-sage-soft"
      : "border-serendipity-border bg-serendipity-surface"
  )

const OptionList = ({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: {
    id: string
    name: string
    description: string
    image: string | null
    disabled?: boolean
  }[]
  selected: string[]
  onToggle: (id: string) => void
}) => {
  if (!options.length) {
    return (
      <p className="text-serendipity-muted">
        Todavía no hay opciones en este paso.
      </p>
    )
  }

  return (
    <ul className="grid gap-3" aria-label={label}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id)

        return (
          <li key={option.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              data-testid="blend-option"
              disabled={option.disabled}
              onClick={() => onToggle(option.id)}
              className={optionClass(isSelected)}
            >
              <span className="flex items-center gap-4">
                {option.image ? (
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-large">
                    <Image
                      src={option.image}
                      alt=""
                      fill
                      sizes="4rem"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <span>
                  <span className="block font-medium text-serendipity-primary">
                    {option.name}
                  </span>
                  {option.description ? (
                    <span className="mt-1 block text-sm leading-6 text-serendipity-muted">
                      {option.description}
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="mt-2 block text-sm text-serendipity-accent">
                      Elegida
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const IngredientStep = ({
  category,
  ingredients,
  selectedIds,
  onToggle,
}: {
  category: BlendCategory
  ingredients: BlendCatalogIngredient[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) => {
  const visible = ingredients.filter((item) => item.category === category)
  const atLimit = selectedIds.length >= MAX_INGREDIENTS

  return (
    <div className="space-y-4">
      {atLimit ? (
        <p className="text-sm text-serendipity-muted">
          Puedes elegir hasta 6 ingredientes.
        </p>
      ) : null}
      <OptionList
        label={STEP_COPY[category].title}
        options={visible.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          disabled: atLimit && !selectedIds.includes(item.id),
        }))}
        selected={selectedIds}
        onToggle={onToggle}
      />
    </div>
  )
}

export default BlendBuilder
