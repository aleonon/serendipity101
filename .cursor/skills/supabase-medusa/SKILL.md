---
name: supabase-medusa
description: Configura y diagnostica PostgreSQL de Supabase para Medusa. Úsala al preparar DATABASE_URL, SSL, migraciones, CORS o conectividad del backend.
paths:
  - "store/apps/backend/**"
  - "store/**/.env*"
---

# Supabase para Medusa

## Límites

- Supabase actúa únicamente como PostgreSQL administrado.
- La conexión permitida es Backend de Medusa → PostgreSQL; nunca Browser → PostgreSQL.
- No introduzcas Supabase Auth, Storage, cliente JavaScript ni variables públicas con credenciales.

## Workflow

1. Solicita la URI real de Session Pooler; no fabriques credenciales.
2. Guarda `DATABASE_URL` solo en el `.env` del backend y empieza con `?sslmode=require`.
3. Confirma que los archivos de entorno están ignorados por Git.
4. Mantén `databaseUrl: process.env.DATABASE_URL`.
5. Añade `rejectUnauthorized: false` únicamente después de reproducir un error TLS/certificado específico.
6. Ejecuta el comando de base de datos soportado por el CLI instalado y después crea el usuario local solicitado.
7. Verifica backend, Admin y CORS desde los orígenes configurados.

## Seguridad y diagnóstico

- No imprimas URIs completas; redacta usuario, contraseña y host cuando informes.
- Distingue errores DNS, autenticación, TLS, pooler y migración antes de cambiar configuración.
- No debilites SSL si la conexión funciona.
