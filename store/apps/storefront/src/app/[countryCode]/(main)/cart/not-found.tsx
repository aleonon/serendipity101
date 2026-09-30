import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "Esta página no existe.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Carrito no encontrado</h1>
      <p className="text-small-regular text-ui-fg-base">
        No encontramos ese carrito. Vuelve al inicio y empieza de nuevo.
      </p>
      <InteractiveLink href="/">Volver al inicio</InteractiveLink>
    </div>
  )
}
