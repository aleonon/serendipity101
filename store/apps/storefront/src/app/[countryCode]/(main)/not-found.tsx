import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "Esta página no existe.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Página no encontrada</h1>
      <p className="text-small-regular text-ui-fg-base">
        La página que buscas no existe o ya no está disponible.
      </p>
      <InteractiveLink href="/">Volver al inicio</InteractiveLink>
    </div>
  )
}
