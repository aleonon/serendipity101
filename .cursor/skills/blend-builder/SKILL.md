---
name: blend-builder
description: Modela e implementa el creador de mezclas personalizadas de Serendipity. Úsala para ingredientes, proporciones, validación, precio, persistencia y conversión de una mezcla en una línea de carrito.
paths:
  - "store/apps/backend/**"
  - "store/apps/storefront/**"
---

# Blend Builder

## Modelo

- Separa catálogo de ingredientes, receta elegida, reglas de composición y producto vendible.
- Usa identificadores estables; no persistas nombres o precios como única referencia.
- Mantén unidades y precisión explícitas y normaliza proporciones antes de guardar.
- Calcula disponibilidad y precio definitivo en el backend.
- Guarda una instantánea legible de la receta en la línea de carrito para pedidos históricos.

## Workflow

1. Inspecciona extensiones, módulos y metadatos soportados por la versión instalada de Medusa.
2. Define límites: peso total, mínimos, máximos, incompatibilidades y cantidad de ingredientes.
3. Implementa un validador puro y compartible; vuelve a validar en el servidor.
4. Crea una operación idempotente para añadir la mezcla válida al carrito.
5. Permite editar una receta sin mutar silenciosamente una línea ya confirmada.

## Validación

- Prueba suma de proporciones, redondeo, límites, duplicados, agotados y manipulación cliente.
- Verifica que el precio mostrado coincide con el autorizado por backend.
- Ejecuta tests, typecheck, lint y build relevantes.
