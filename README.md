# Serendipity

Casa de té de especialidad. Este repositorio contiene el ecommerce: catálogo, carrito, checkout, retiro en local y un constructor de mezclas.

No es un marketplace ni un CMS. El comercio corre sobre Medusa. La base de datos es PostgreSQL administrado en Supabase. El storefront es Next.js.

## Stack

| Pieza | Rol |
| --- | --- |
| **Node.js 22 LTS** y **pnpm** | Runtime y gestor de paquetes. No usar Node 23. |
| **Medusa v2** | Backend de comercio: productos, carrito, envíos, promociones, pedidos, admin. |
| **Next.js 15** | Storefront (App Router) en `store/apps/storefront`. |
| **Supabase** | Solo PostgreSQL administrado. Medusa se conecta con `DATABASE_URL`. |

Supabase no se usa para Auth, Storage ni SDK de navegador. El storefront nunca habla con PostgreSQL: solo llama a la Store API de Medusa. `DATABASE_URL` no se expone al cliente.

## Cómo se conectan

```
Navegador
    │
    │  HTTP (catálogo, carrito, checkout)
    ▼
Storefront  ─ Next.js :8000
    │
    │  Store API + publishable key
    ▼
Backend     ─ Medusa v2 :9000
    │         Admin en :9000/app
    │
    │  DATABASE_URL (servidor)
    ▼
PostgreSQL  ─ Supabase
```

- El storefront usa `NEXT_PUBLIC_MEDUSA_BACKEND_URL` y una **publishable API key**.
- Medusa usa `DATABASE_URL` hacia Supabase y CORS (`STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`) para el origen del storefront y del admin.
- La región de venta es Ecuador (`ec`).

## Estructura

```
store/
  apps/
    backend/      Medusa: API, admin, workflows, seed y scripts
    storefront/   Next.js: tienda, Blend Builder, animaciones
```

**Backend.** Productos, variantes, carrito, envío a Ecuador, retiro en local con 5% automático, Blend Builder (validación en servidor) y pagos. En desarrollo el proveedor es el manual de Medusa. Un proveedor de producción se elige después; sus secretos viven en el entorno, no en el cliente.

**Storefront.** Home editorial, catálogo, ficha de producto, carrito, checkout, cuenta y «Crea tu mezcla». La dirección visual es editorial; GSAP y la secuencia bloom se usan en desktop cuando el movimiento está permitido.

## Desarrollo local

Requisitos: Node.js 22 LTS, pnpm, y un PostgreSQL (local o el de Supabase).

```bash
cd store
pnpm install
```

1. Copia `apps/backend/.env.example` a `apps/backend/.env` y define `DATABASE_URL`, `JWT_SECRET` y `COOKIE_SECRET`.
2. En el backend: migraciones, usuario admin y `pnpm dev` (`http://localhost:9000`).
3. Copia `apps/storefront/.env.example` a `apps/storefront/.env.local`, pon la publishable key de Medusa y `pnpm dev` (`http://localhost:8000`).

Los archivos `.env` no se suben a git. En producción, CORS y secretos deben ser valores reales, no placeholders.

## Documentación de Medusa

El README de `store/` describe el starter DTC original. Este archivo describe Serendipity.
