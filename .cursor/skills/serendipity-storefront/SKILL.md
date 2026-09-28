---
name: serendipity-storefront
description: Diseña e implementa el storefront editorial de Serendipity. Úsala para navegación, catálogo, producto, variantes, carrito, checkout y el sistema visual botánico de la tienda.
paths:
  - "store/apps/storefront/**"
---

# Serendipity Storefront

## Principios

- Combina una dirección botánica, artesanal, cálida y editorial con interacción moderna.
- Evita patrones visuales genéricos de SaaS y conserva jerarquías claras de e-commerce.
- Prioriza legibilidad, navegación predecible, foco visible, teclado, contraste y movimiento reducido.
- Diseña responsive desde contenido real; evita componentes acoplados a datos mock.
- Centraliza tokens de color, tipografía, espaciado, radios, elevación y movimiento.

## Workflow

1. Comprueba cómo el starter obtiene región, productos, variantes y carrito.
2. Define la responsabilidad de datos en server/client components antes de crear UI.
3. Construye una sola ruta o flujo por iteración y reutiliza primitivas existentes.
4. Representa loading, vacío, error, agotado y selección inválida.
5. Verifica carrito y precios con datos devueltos por Medusa, no cálculos de presentación.

## Validación

- Prueba viewport móvil y desktop, navegación por teclado y `prefers-reduced-motion`.
- Ejecuta typecheck, lint y build del storefront.
- Comprueba que catálogo, producto y carrito usan el backend real cuando esté disponible.
