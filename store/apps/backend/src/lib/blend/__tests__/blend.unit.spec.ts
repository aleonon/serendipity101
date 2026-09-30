import { BASES, INGREDIENT_ROLES } from "../catalog"
import { presentBlend } from "../present-blend"
import {
  BlendValidationError,
  allocateIntegerShares,
  blendLineKey,
  composeBlend,
  sharesAreValid,
  toCartLine,
  type ResolvedCatalog,
} from "../validate-blend"

const catalog: ResolvedCatalog = {
  bases: [
    { id: "base-herbal", name: "Infusión herbal" },
    { id: "base-floral", name: "Infusión floral" },
  ],
  ingredients: [
    { id: "menta", name: "Menta", category: "leaf" },
    { id: "lavanda", name: "Lavanda", category: "flower" },
    { id: "rosa-frambuesa", name: "Rosa & Frambuesa", category: "fruit" },
  ],
  variants: [
    { id: "variant_50", title: "50 g", grams: 50 },
    { id: "variant_100", title: "100 g", grams: 100 },
    { id: "variant_200", title: "200 g", grams: 200 },
  ],
}

const validInput = {
  variant_id: "variant_100",
  base_id: "base-herbal",
  ingredient_ids: ["menta", "lavanda"],
  blend_name: "Mi Serendipity",
  total_grams: 1,
  percentages: [-20, 500],
  ingredients: [{ id: "menta", name: "Nombre falso", percentage: 99 }],
  base: { id: "base-herbal", name: "Té negro" },
}

describe("blend composition", () => {
  it("builds a valid snapshot from catalog ids and ignores client names", () => {
    const snapshot = composeBlend(validInput, catalog)

    expect(snapshot.blend_version).toBe(1)
    expect(snapshot.blend_name).toBe("Mi Serendipity")
    expect(snapshot.total_grams).toBe(100)
    expect(snapshot.base).toEqual({
      id: "base-herbal",
      name: "Infusión herbal",
      percentage: 34,
    })
    expect(snapshot.ingredients).toEqual([
      { id: "menta", name: "Menta", category: "leaf", percentage: 33 },
      { id: "lavanda", name: "Lavanda", category: "flower", percentage: 33 },
    ])
    expect(
      snapshot.base.percentage +
        snapshot.ingredients.reduce((sum, item) => sum + item.percentage, 0)
    ).toBe(100)
  })

  it("rejects an empty or duplicate selection", () => {
    expect(() =>
      composeBlend({ variant_id: "variant_100", ingredient_ids: [] }, catalog)
    ).toThrow(BlendValidationError)

    expect(() =>
      composeBlend(
        {
          variant_id: "variant_100",
          base_id: "base-herbal",
          ingredient_ids: ["menta", "menta"],
        },
        catalog
      )
    ).toThrow(/repetido/)

    expect(() =>
      composeBlend(
        {
          variant_id: "variant_100",
          base_id: "base-missing",
          ingredient_ids: ["menta"],
        },
        catalog
      )
    ).toThrow(/base/)
  })

  it("rejects percentages that are negative, NaN, above 100, or short of 100", () => {
    expect(sharesAreValid([-1, 101])).toBe(false)
    expect(sharesAreValid([Number.NaN])).toBe(false)
    expect(sharesAreValid([101])).toBe(false)
    expect(sharesAreValid([50, 49])).toBe(false)
    expect(sharesAreValid([50.5, 49.5])).toBe(false)
    expect(sharesAreValid(allocateIntegerShares(7, 100))).toBe(true)
    expect(allocateIntegerShares(3, 100)).toEqual([34, 33, 33])
  })

  it("rejects an unknown variant and an unknown ingredient", () => {
    expect(() =>
      composeBlend(
        {
          variant_id: "variant_missing",
          base_id: "base-herbal",
          ingredient_ids: ["menta"],
        },
        catalog
      )
    ).toThrow(/presentación/)

    expect(() =>
      composeBlend(
        {
          variant_id: "variant_50",
          base_id: "base-herbal",
          ingredient_ids: ["durazno"],
        },
        catalog
      )
    ).toThrow(/no existe/)
  })

  it("stores the recipe as cart metadata without a custom unit price", () => {
    const snapshot = composeBlend(validInput, catalog)
    const line = toCartLine(snapshot, "variant_100")

    expect(line).toEqual({
      variant_id: "variant_100",
      quantity: 1,
      metadata: snapshot,
    })
    expect(line).not.toHaveProperty("unit_price")
    expect(blendLineKey(snapshot, "variant_100")).toBe(
      blendLineKey(snapshot, "variant_100")
    )
    expect(blendLineKey(snapshot, "variant_50")).not.toBe(
      blendLineKey(snapshot, "variant_100")
    )
  })

  it("renders the recipe as text instead of raw metadata", () => {
    const snapshot = composeBlend(
      { ...validInput, blend_name: "  Mi   Serendipity!!! " },
      catalog
    )
    const view = presentBlend(snapshot)

    expect(view).toEqual({
      name: "Mi Serendipity",
      gramsLabel: "100 g",
      baseLine: "Infusión herbal 34%",
      ingredientLines: [
        { id: "menta", label: "Menta 33%" },
        { id: "lavanda", label: "Lavanda 33%" },
      ],
    })
    expect(view?.ingredientLines.map((line) => line.label).join("\n")).not.toMatch(
      /blend_version|\{/
    )
    expect(presentBlend({ blend_version: 1, ingredients: [] })).toBeNull()
    expect(
      presentBlend({
        ...snapshot,
        ingredients: [{ ...snapshot.ingredients[0], percentage: -5 }],
      })
    ).toBeNull()
  })

  it("keeps the registry on real catalog roles and off invented teas", () => {
    expect(BASES.map((base) => base.id)).toEqual([
      "base-herbal",
      "base-floral",
      "base-citrus",
    ])
    expect(BASES.some((base) => /negro|oolong|verde/i.test(base.name))).toBe(false)
    expect(INGREDIENT_ROLES.map((role) => role.category)).toEqual([
      "leaf",
      "leaf",
      "leaf",
      "flower",
      "flower",
      "flower",
      "fruit",
    ])
    expect(INGREDIENT_ROLES.filter((role) => role.category === "fruit").map((role) => role.id)).toEqual([
      "rosa-frambuesa",
    ])
  })
})
