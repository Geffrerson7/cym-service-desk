---
name: local-db
description: Configuración y uso del PostgreSQL local en Docker (compose.yaml, docker/initdb, .env local, base cym_test) y del flujo de migraciones y seed. Úsala al crear o cambiar compose.yaml, al preparar el entorno local, al aplicar migraciones o al reiniciar la base.
---

# Entorno de desarrollo local (Docker + PostgreSQL)

En desarrollo la base de datos es **PostgreSQL en Docker**, nunca Neon. Neon queda para los despliegues de Vercel (vista previa, demo y producción). Así no se ensucian las ramas de Neon y se puede trabajar sin conexión.

## `compose.yaml` (raíz del proyecto)

- Imagen oficial `postgres:17`: la misma versión mayor que Neon y que el servicio del CI.
- Nombre del servicio `db`, puerto `5432:5432`, volumen con nombre `cym-pgdata` para que los datos sobrevivan al reiniciar, y `healthcheck` con `pg_isready`.
- Usuario, contraseña y base salen de variables del `.env` local (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`), con valores por defecto solo para desarrollo. No escribas contraseñas en `compose.yaml`.
- Una segunda base, `cym_test`, para las pruebas de integración de Vitest, creada con un script en `docker/initdb/` (se ejecuta solo la primera vez que se crea el volumen). Las pruebas nunca usan la base de desarrollo.

## `.env` local

- `DATABASE_URL` y `DATABASE_URL_UNPOOLED` apuntan al mismo Postgres de Docker (`postgresql://<usuario>:<contraseña>@localhost:5432/<base>`). En local no hay pooler, así que las dos URLs son iguales.
- `TEST_DATABASE_URL` apunta a `cym_test` en el mismo servidor.
- `.env.example` documenta estos valores de desarrollo (sin secretos reales).

## Flujo de trabajo

1. `docker compose up -d`: levanta Postgres.
2. `pnpm prisma migrate dev`: aplica y crea migraciones (solo contra Docker; nunca `migrate dev` contra Neon).
3. `pnpm prisma db seed`: crea el `ADMIN_GENERAL` inicial y los datos base. Con `DEMO_MODE=true` en el `.env` local también se pueden cargar los datos ficticios de la demo para probarla.
4. `pnpm dev`.

- Para borrar todo y empezar de cero: `docker compose down -v` y repetir los pasos. Esto también vuelve a ejecutar el script de `docker/initdb/`.
- Para preparar la base de pruebas: `pnpm prisma migrate deploy` con `DATABASE_URL_UNPOOLED` apuntando a `cym_test`.

## Límites

- **Contra Neon solo corre `pnpm prisma migrate deploy`**, en el despliegue. Ninguna tarea de desarrollo apunta a Neon.
- Docker es solo una herramienta de desarrollo: la app se despliega en Vercel, así que no crees un `Dockerfile` para la app.
