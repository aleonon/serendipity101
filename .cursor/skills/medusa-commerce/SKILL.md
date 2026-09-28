---
name: medusa-commerce
description: Implementa y valida flujos de comercio con Medusa v2. Úsala al trabajar en módulos, Store API, Admin, regiones, sales channels, productos, variantes, carritos, fulfillment, promociones o pagos.
paths:
  - "store/apps/backend/**"
  - "store/apps/storefront/**"
---

# Medusa Commerce

## Procedimiento

1. Inspecciona `package.json`, configuración, tipos y módulos instalados antes de escribir código.
2. Confirma la API de Medusa v2 en el código o tipos locales; no adaptes ejemplos de v1 ni inventes métodos.
3. Mantén la lógica comercial en el backend y consume el Store API/SDK tipado desde el storefront.
4. Modela productos, variantes, regiones, sales channels, fulfillment y promociones como conceptos separados.
5. Para pagos, muestra únicamente proveedores y sesiones que el backend tenga configurados.
6. Haz cambios pequeños y compatibles con migraciones y datos existentes.

## Validación

- Ejecuta las migraciones/comandos de Medusa aplicables desde el backend.
- Ejecuta typecheck, lint y build definidos por cada paquete.
- Verifica con una petición real que el Store API devuelve datos.
- Comprueba que errores de red o configuración tengan mensajes accionables y no filtren secretos.
