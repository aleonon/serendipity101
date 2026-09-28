---
name: web-performance
description: Audita y mejora el rendimiento web del storefront sin degradar su diseño. Úsala para imágenes, fuentes, JavaScript, Core Web Vitals, caché, renderizado y animaciones.
paths:
  - "store/apps/storefront/**"
---

# Web Performance

## Workflow

1. Mide antes de optimizar en una build de producción y registra el escenario.
2. Identifica si el cuello está en servidor, red, JavaScript, render, imágenes, fuentes o terceros.
3. Conserva server components por defecto y reduce límites cliente.
4. Optimiza imágenes con dimensiones y tamaños responsive; reserva espacio para evitar CLS.
5. Carga fuentes con estrategia explícita y el mínimo de pesos.
6. Importa animaciones y código pesado solo donde se usan.
7. Aplica caché y revalidación según volatilidad comercial; no sirvas precio o stock obsoleto sin una política consciente.

## Criterios

- Evalúa LCP, INP y CLS en móvil y desktop.
- Evita trabajo de scroll continuo, listeners sin cleanup y animaciones que fuercen layout.
- No sacrifiques accesibilidad ni exactitud del carrito para mejorar una métrica.
- Compara mediciones antes/después y ejecuta typecheck, lint y build.
