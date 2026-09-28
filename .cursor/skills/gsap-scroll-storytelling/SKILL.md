---
name: gsap-scroll-storytelling
description: Implementa narrativa de scroll accesible y eficiente con GSAP. Úsala para secuencias editoriales, ScrollTrigger, transiciones y movimiento expresivo en el storefront.
paths:
  - "store/apps/storefront/**/*.{ts,tsx,css}"
---

# GSAP Scroll Storytelling

## Workflow

1. Confirma que GSAP está instalado antes de importarlo.
2. Define primero una experiencia funcional sin animación.
3. Limita GSAP a componentes cliente y registra plugins una sola vez.
4. Crea animaciones dentro de un contexto con alcance local y elimínalo en cleanup.
5. Usa transformaciones y opacidad; evita animar propiedades que fuerzan layout.
6. Recalcula medidas cuando cambien fuentes, imágenes o breakpoint.
7. Ofrece una variante estática cuando `prefers-reduced-motion` esté activo.

## Criterios

- El scroll nativo, enlaces y controles siguen funcionando sin JavaScript de animación.
- No hay pinning excesivo, contenido inaccesible ni saltos de layout.
- No se crean triggers duplicados al navegar o remontar componentes.
- La animación no bloquea interacción ni oculta estados de carga o error.
- Verifica móvil, desktop, navegación interna y build de producción.
