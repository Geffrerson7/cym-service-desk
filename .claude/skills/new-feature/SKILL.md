---
name: new-feature
description: Lista de pasos para implementar una historia de usuario de punta a punta (esquema Zod, servicio con permisos y auditoría, repositorio, Server Action, pantalla con estados y pruebas). Úsala al empezar cualquier HU de docs/historias-de-usuario.md o una funcionalidad nueva.
---

# Implementar una historia de usuario

Sigue este orden. Cada paso respeta las reglas de `AGENTS.md`.

1. **Lee la historia** en `docs/historias-de-usuario.md` y sus criterios de aceptación. Si toca estados, revisa el cuadro del punto 17 de `docs/prompt-1.md`. Si algo está en "Fuera del alcance del MVP", no lo hagas. Si dos documentos se contradicen, pregunta.
2. **Consulta la documentación** de la API que vayas a usar: Next.js en `node_modules/next/dist/docs/`; Prisma, Better Auth, Zod y Cloudinary con Context7.
3. **Esquema de datos** (si hace falta): cambia `prisma/schema.prisma`, crea la migración con `pnpm prisma migrate dev --name <descripcion>` y ejecuta `pnpm prisma generate`. Dinero en `Decimal(10, 2)`.
4. **Validación:** esquema Zod 4 en `lib/schemas/<dominio>.ts`, con mensajes en español usando `error`.
5. **Repositorio** (`repositories/<dominio>.ts`): consultas puras con Prisma, sin reglas de negocio. Recibe el cliente de transacción cuando la operación lo necesita.
6. **Servicio** (`services/<dominio>.ts`):
   - Carga el usuario por `id` y verifica `isActive`, `role` y `branchId`.
   - Rechaza el rol `DEMO` en toda mutación.
   - Aplica las reglas de negocio (máquina de estados, garantías, liquidación, etc.).
   - Escribe el historial de auditoría en la misma transacción que el cambio.
   - Devuelve `ActionResult<T>` con errores en español.
7. **Interfaz** (`app/` y `components/`):
   - La Server Action valida con Zod, llama al servicio y devuelve su `ActionResult`.
   - La pantalla tiene estados de carga (`<Suspense>` o `loading.tsx` con esqueletos), vacío, error (`error.tsx`) y deshabilitado. El envío muestra "Guardando…".
   - Usa `components/ui/`, tokens semánticos y `OrderStatusBadge`. Mobile-first; desde `md:` tablas.
   - Envía a los Client Components solo los datos que muestran.
8. **Pruebas** (`*.test.ts` junto al código): reglas del servicio, permisos por rol (incluido `DEMO`) y casos límite de fechas en `America/Lima`.
9. **Definición de terminado:** `pnpm format`, y luego `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Reporta cualquier fallo.
10. **Revisa a mano** en `pnpm dev` con cada rol que la historia menciona, en tema claro y oscuro y a 360 px si es la vista pública.
