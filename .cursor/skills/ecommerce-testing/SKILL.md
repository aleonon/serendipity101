---
name: ecommerce-testing
description: Prueba flujos críticos de comercio de Serendipity. Úsala al validar catálogo, variantes, mezcla personalizada, carrito, entrega, retiro, descuento, checkout y pagos configurados.
paths:
  - "store/**/*.{test,spec}.{ts,tsx}"
  - "store/apps/backend/**"
  - "store/apps/storefront/**"
---

# E-commerce Testing

## Estrategia

1. Identifica el límite correcto: unidad para reglas puras, integración para Medusa/DB y E2E para recorridos.
2. Usa datos deterministas y aislados; no dependas del orden de ejecución.
3. Prueba comportamiento observable, no detalles internos de componentes.
4. Incluye éxito, vacío, fallo de red, datos inválidos y concurrencia relevante.

## Flujos mínimos

- Catálogo → producto → variante válida → añadir al carrito.
- Mezcla válida e inválida → precio autorizado → línea de carrito.
- Entrega a domicilio sin descuento de retiro.
- Retiro configurado realmente → descuento del 5%; cambio a domicilio → descuento retirado.
- Checkout solo ofrece fulfillment y pagos devueltos por backend.
- Carrito conserva cantidades, moneda, región y totales tras recarga.

## Validación

- Confirma que el 5% se aplica mediante reglas comerciales del backend, no solo UI.
- Evita snapshots grandes; afirma totales, IDs, estados y efectos relevantes.
- Ejecuta tests, typecheck, lint y build antes de cerrar la fase.
