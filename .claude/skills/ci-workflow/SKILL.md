---
name: ci-workflow
description: Reglas para crear, modificar o depurar el workflow de GitHub Actions (.github/workflows/ci.yml) del proyecto. Úsala al tocar el CI, cuando falla el check "CI / verify" o al cambiar los scripts de package.json que usa el CI.
---

# Integración continua (GitHub Actions)

El CI ejecuta exactamente la **definición de terminado** de `AGENTS.md`: si pasa en local, debe pasar en el CI, y al revés. El CI **no despliega**: el despliegue lo hace la integración de Git de Vercel (vista previa en cada PR, producción al fusionar en `main`).

## Archivo y disparadores

- Un único workflow: `.github/workflows/ci.yml`, con nombre `CI` y un job `verify` en `ubuntu-latest`.
- Se ejecuta en `pull_request` hacia `main` y en `push` a `main`. No se ejecuta si el cambio solo toca `docs/**` (con `paths-ignore`, sin patrones de negación `!`). Hoy `docs/` no se versiona, así que ese filtro no tiene efecto; se mantiene por si algún día se suben documentos públicos. El CI nunca depende de archivos de `docs/`. Los `.md` fuera de `docs/` (como `AGENTS.md` o estas skills) sí lo disparan, para que el check obligatorio `CI / verify` se reporte en esos PR.
- `concurrency` por rama (`ci-${{ github.ref }}`) con `cancel-in-progress: true`, para que un push nuevo cancele la ejecución anterior.
- `timeout-minutes: 15`.

## Seguridad

- `permissions: contents: read` a nivel de workflow; ningún job pide más permisos.
- Las acciones de terceros se fijan por **SHA completo del commit**, con la versión en un comentario (`actions/checkout@<sha> # v5.x.x`), nunca por etiqueta móvil (`@v5`, `@main`). Al crear o actualizar el workflow, consulta la versión estable vigente de cada acción.
- **Sin secretos reales en el CI.** No se conecta a Neon, Cloudinary ni Better Auth de verdad. Las variables de entorno necesarias para compilar llevan valores ficticios declarados en el propio workflow (por ejemplo `BETTER_AUTH_SECRET: ci-dummy-secret-not-used-in-production`). Si algún paso necesita un secreto real, detente y pide autorización.
- El código no debe acceder a la base de datos ni a servicios externos durante `pnpm build`: las páginas con datos son dinámicas y quedan detrás de `<Suspense>`. Si el build falla por falta de conexión, el error está en el código, no en el CI.

## Entorno

- Node.js **24 (LTS)** con `actions/setup-node`, usando `cache: pnpm`.
- pnpm con `pnpm/action-setup`. La versión sale del campo `packageManager` de `package.json`; no la repitas en el workflow.
- `NEXT_TELEMETRY_DISABLED: 1` y `TZ: UTC`, para reproducir el entorno de Vercel y detectar errores de zona horaria (las fechas de negocio se calculan en `America/Lima`).
- Caché de `.next/cache` con `actions/cache`, con una clave que combine el hash de `pnpm-lock.yaml` y el de los archivos fuente.
- Servicio `postgres` (imagen oficial, versión mayor igual a la de Neon) con healthcheck. Solo se usa para validar migraciones y para pruebas de integración, nunca con datos reales.
- Cuando exista la primera prueba de integración, agrega `TEST_DATABASE_URL` apuntando a la base del servicio (ver "Pruebas" en `AGENTS.md`).

## Pasos del job `verify` (en este orden; cualquier fallo detiene el job)

1. `actions/checkout`.
2. Configurar pnpm y Node (con caché del store).
3. `pnpm install --frozen-lockfile`. Falla si `pnpm-lock.yaml` no coincide con `package.json`; nunca uses `--no-frozen-lockfile` en el CI.
4. `pnpm prisma generate`.
5. **Migraciones:** `pnpm prisma migrate deploy` contra el Postgres del servicio, para comprobar que todas las migraciones se aplican desde cero. Después, `pnpm prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` (flags verificados en Prisma 7.10.1), que falla si hay cambios en el esquema sin migración. Los pasos de Prisma solo se ejecutan cuando existe `prisma/schema.prisma`.
6. `pnpm format:check`.
7. `pnpm lint`.
8. `pnpm typecheck`.
9. `pnpm test`.
10. `pnpm build`.

## Reglas de trabajo

- `main` está protegida: solo se fusiona por PR y con el check `CI / verify` en verde. No se usa `--no-verify` ni se omiten pasos para que el CI pase.
- Si el CI falla, se corrige la causa. No se desactiva el paso, no se agregan `continue-on-error` ni se marcan pruebas como `skip` sin avisar al usuario.
- El desarrollo es en Windows y el CI corre en Linux. `.gitattributes` fija `* text=auto eol=lf`, y las rutas de importación deben respetar mayúsculas y minúsculas exactas, porque Linux las distingue.
- **Fuera del CI por ahora** (requieren autorización, porque agregan herramientas): Lighthouse CI para las metas de la vitrina, pruebas end-to-end con navegador y Dependabot o Renovate.
