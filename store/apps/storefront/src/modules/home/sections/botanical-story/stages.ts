export const STORY_STAGES = [
  {
    id: "origin",
    index: "01",
    label: "Origen",
    title: "Todo comienza en el origen.",
    body: "Cada infusión comienza con una materia prima, un lugar y una forma de cultivarla.",
  },
  {
    id: "leaf",
    index: "02",
    label: "Hoja",
    title: "Hoja",
    body: "Las hojas construyen la estructura de la mezcla.",
  },
  {
    id: "flower",
    index: "03",
    label: "Flor",
    title: "Flor",
    body: "Las flores aportan aroma, delicadeza y carácter visual.",
  },
  {
    id: "fruit",
    index: "04",
    label: "Fruta",
    title: "Fruta",
    body: "Las frutas añaden capas de aroma y sabor.",
  },
  {
    id: "infusion",
    index: "05",
    label: "Infusión",
    title: "Y entonces aparece algo distinto.",
    body: "Una combinación que puede sentirse familiar y nueva al mismo tiempo.",
  },
] as const

export type StoryStageId = (typeof STORY_STAGES)[number]["id"]

export const LEAF_SRC = "/serendipity/hero/leaf.svg"
export const FLOWER_SRC = "/serendipity/hero/flower_02.png"
export const FRUIT_SRC = "/serendipity/hero/fruit.png"

export const PLATE_WIDTH = 1920
export const PLATE_HEIGHT = 1076
