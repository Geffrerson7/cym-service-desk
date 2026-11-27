<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del proyecto

Módulo web de servicio técnico y garantías para **CYM Computadoras e Ingeniería** (Trujillo, Perú).
Este archivo vive en la raíz del proyecto (`cym-service-desk/`). Todas las rutas de este documento son relativas a esta carpeta.

## Documentación (fuente de verdad)
- `docs/prompt-1.md`: requisitos funcionales del MVP y lo que está fuera de alcance.
- `docs/historias-de-usuario.md`: historias de usuario por sprint y criterios de aceptación.
- `docs/cuadro-de-estados.pdf`: especificación de procesos y cuadro de estados oficial del cliente.
- `docs/diagrama-flujo-procesos.pdf`: diagrama de flujo de servicio técnico y garantías.
- `docs/orden-de-servicio-fisica.pdf`: formato en papel que la orden digital reemplaza.
- `docs/propuesta-sistema.md` y `docs/transcripcion-reunion-cliente.txt`: contexto del cliente.

Si el código y la documentación se contradicen, manda la documentación; si dos documentos se contradicen, pregunta antes de implementar. No implementes nada listado como "Fuera del alcance del MVP".

## Stack (no negociable)
- **Framework:** Next.js **16.4.6** (App Router) con React **19.3** y TypeScript. Es más nuevo que tus datos de entrenamiento: consulta `node_modules/next/dist/docs/` antes de usar una API (ver bloque de Next.js arriba). Ejemplos: el antiguo `middleware.ts` ahora es `proxy.ts`; `cacheComponents` está activado en `next.config.ts`.
- **Base de datos:** PostgreSQL en Neon (vista previa, demo y producción) y PostgreSQL en **Docker** solo para desarrollo local (ver "Entorno de desarrollo local").
- **ORM:** Prisma **v7.10.1** (ver sección Prisma).
- **Autenticación:** Better Auth (email y contraseña, sesiones en base de datos, caché en cookie cifrada JWE y plugin JWT).
- **Almacenamiento de imágenes:** Cloudinary (subida firmada desde el servidor, nunca con upload presets sin firmar; tipo de entrega `authenticated` y URLs firmadas generadas en el servidor; en la base de datos solo se guarda el `public_id` de cada foto).
- **Validación:** Zod.
- **Pruebas:** Vitest.
- **Formato:** Prettier con `prettier-plugin-tailwindcss` (ver "Formato de código").
- **Estilos:** Tailwind CSS **4.3** y CSS.
- **Deploy:** Vercel.

No reemplaces ni agregues frameworks, ORM, bases de datos, librerías de autenticación ni de pruebas sin pedir autorización explícita.

## Gestor de paquetes y comandos
- Usa siempre **pnpm** (`pnpm install`, `pnpm add`, `pnpm dlx`, `pnpm run <script>`). No uses `npm`, `npx`, `yarn` ni `bun`. El único lockfile permitido es `pnpm-lock.yaml`.
- **Definición de terminado:** antes de dar una tarea por completa deben pasar `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`, los mismos pasos del CI (ver "Integración continua"). Si cambias el esquema de Prisma, crea también su migración. Si alguno falla, repórtalo; no lo ocultes.
- **Pruebas:** se usa **Vitest** (`pnpm test` ejecuta `vitest run`). Los archivos de prueba van junto al código que prueban con el sufijo `.test.ts`. Como mínimo deben tener pruebas unitarias: la máquina de estados, el cálculo de liquidación, la vigencia de garantía de producto y el plazo de garantía de servicio.

## Formato de código (Prettier)
- Configuración en `prettier.config.mjs`, con los valores por defecto de Prettier (comillas dobles, punto y coma, 80 columnas, fin de línea LF) y el plugin `prettier-plugin-tailwindcss`.
- El plugin **ordena las clases de Tailwind** en el orden oficial, leyendo el tema desde `app/globals.css` (`tailwindStylesheet`). No ordenes clases a mano ni discutas su orden: lo decide el plugin.
- Si el plugin manda una clase al principio de la lista, esa clase no existe en el tema (token mal escrito o eliminado). Corrígela; no la dejes así.
- Ejecuta `pnpm format` antes de terminar una tarea. `pnpm format:check` corre en el CI y falla si algún archivo no tiene el formato.
- `.prettierignore` excluye lo generado (`.next/`, `generated/`, `prisma/migrations/`, `pnpm-lock.yaml`), además de `docs/`, `AGENTS.md` y `CLAUDE.md`: se editan a mano y el bloque de Next.js de `AGENTS.md` debe quedar intacto.
- ESLint revisa calidad y Prettier revisa formato; no agregues reglas de estilo a ESLint que choquen con Prettier.

## Arquitectura por capas (estricta)
Monolito modular en 3 capas, en la raíz del proyecto (sin carpeta `src/`):

1. **Interfaz (`app/` y `components/`):** Server Components, Client Components, Server Actions y rutas de API (`app/api/`). Nunca importan Prisma ni contienen lógica de negocio; validan la entrada con Zod, delegan a `services/` y renderizan.
2. **Servicios (`services/`):** reglas de negocio, permisos y orquestación. Única capa que llama a los repositorios y a servicios externos (Cloudinary).
3. **Acceso a datos (`repositories/` y `db/`):** única capa que importa el cliente de Prisma. Consultas puras a PostgreSQL, sin reglas de negocio.

`lib/` queda reservada para configuraciones base (`auth.ts`, `cloudinary.ts`), esquemas Zod compartidos y utilidades puras (formato de moneda y fechas).

**Resultado de Server Actions:** devuelve siempre `{ ok: true, data } | { ok: false, error: string }` con `error` en español, listo para mostrar al usuario. Nunca envíes al navegador mensajes internos, stack traces ni errores de Prisma.

## Entorno de desarrollo local (Docker + PostgreSQL)
- En desarrollo la base de datos es **PostgreSQL en Docker**, nunca Neon. Neon queda para los despliegues de Vercel (vista previa, demo y producción). Así no se ensucian las ramas de Neon y se puede trabajar sin conexión.
- El servicio se define en `compose.yaml` (raíz del proyecto) con Docker Compose:
  - Imagen oficial `postgres:17`: la misma versión mayor que Neon y que el servicio del CI.
  - Nombre del servicio `db`, puerto `5432:5432`, volumen con nombre `cym-pgdata` para que los datos sobrevivan al reiniciar, y `healthcheck` con `pg_isready`.
  - Usuario, contraseña y base salen de variables del `.env` local (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`), con valores por defecto solo para desarrollo. No escribas contraseñas en `compose.yaml`.
  - Una segunda base, `cym_test`, para las pruebas de integración de Vitest, creada con un script en `docker/initdb/`. Las pruebas nunca usan la base de desarrollo.
- En el `.env` local, `DATABASE_URL` y `DATABASE_URL_UNPOOLED` apuntan al mismo Postgres de Docker (`postgresql://<usuario>:<contraseña>@localhost:5432/<base>`). En local no hay pooler, así que las dos URLs son iguales. `.env.example` documenta estos valores de desarrollo.
- Flujo de trabajo:
  1. `docker compose up -d`: levanta Postgres.
  2. `pnpm prisma migrate dev`: aplica y crea migraciones (solo contra Docker; nunca `migrate dev` contra Neon).
  3. `pnpm prisma db seed`: crea el `ADMIN_GENERAL` inicial y los datos base. Con `DEMO_MODE=true` en el `.env` local también se pueden cargar los datos ficticios de la demo para probarla.
  4. `pnpm dev`.
  - Para borrar todo y empezar de cero: `docker compose down -v` y repetir los pasos.
- **Contra Neon solo corre `pnpm prisma migrate deploy`**, en el despliegue. Ninguna tarea de desarrollo apunta a Neon.
- Docker es solo una herramienta de desarrollo: la app no se despliega en contenedores (se despliega en Vercel), así que no crees un `Dockerfile` para la app.

## Prisma 7.10.1
- El esquema (`prisma/schema.prisma`) **no lleva URL de conexión**. La URL para la CLI y las migraciones va en `prisma.config.ts` con `env('DATABASE_URL_UNPOOLED')`.
- `prisma.config.ts` **no carga `.env` automáticamente**: debe empezar con `import 'dotenv/config'`.
- Generador `prisma-client` con `output` personalizado (`generated/prisma`, ignorado en git). Importa los tipos y el cliente desde esa ruta, nunca desde `@prisma/client`.
- El cliente se crea con el driver adapter `@prisma/adapter-pg` (`new PrismaPg({ connectionString: process.env.DATABASE_URL })`) usando `DATABASE_URL` (pooled), como **singleton** en `db/prisma.ts`. No uses `@prisma/adapter-neon`.
- Usa `pnpm prisma migrate dev --name <descripcion>` para crear migraciones y `pnpm prisma generate` tras cualquier cambio en el esquema. Nunca edites una migración ya aplicada.
- **Seed:** `prisma/seed.ts` crea la única forma de arrancar el sistema: el primer `ADMIN_GENERAL` (con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`), la configuración de tarifas por defecto y los tipos de equipo. Debe ser idempotente.

## Variables de entorno
Solo en el servidor; nunca con prefijo `NEXT_PUBLIC_` ni enviadas al navegador. Mantén `.env.example` actualizado (sin valores reales) y nunca subas `.env` al repositorio.
- `DATABASE_URL` (runtime) y `DATABASE_URL_UNPOOLED` (migraciones). En Vercel: Neon con pooler y Neon directo. En local: las dos apuntan al Postgres de Docker.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: solo en el `.env` local, para `compose.yaml`.
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- `DEMO_MODE` (`true` solo en el despliegue de demostración), `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`. Las credenciales demo las usan `prisma/seed-demo.ts` (para crear la cuenta) y el botón "Entrar como demo" (para iniciar sesión). Nunca llegan al navegador.

## Seguridad y autenticación (Better Auth)
- **Sesión solo en el servidor:** nunca uses `useSession()`, `authClient.getSession()` ni hooks de sesión en Client Components. Se lee con `auth.api.getSession` en Server Components, Server Actions y rutas de API.
- **Sin registro público:** no habilites `sign-up` ni crees pantallas o endpoints de registro. Solo el `ADMIN_GENERAL` crea cuentas de personal.
- **JWT minimalista (rutas de API):** plugin JWT, 15 minutos, cabecera `Authorization: Bearer`, verificado con las claves de su endpoint JWKS. El payload contiene **únicamente el `id` del usuario**: el plugin incluye por defecto más datos del usuario, así que configúralo explícitamente. Nunca incluyas rol, sucursal, nombre ni correo.
- **Validación en cada acción:** en cada Server Action y endpoint, carga el usuario desde la base de datos por su `id` y verifica `isActive`, `role` y `branchId`. Nunca confíes en roles, IDs de sucursal ni precios enviados desde el navegador.
- **Desactivar una cuenta** revoca todas sus sesiones, para que la caché en cookie no la mantenga activa.
- **Caché:** con `cacheComponents` activado, nunca uses `"use cache"` en datos que dependan del usuario, del rol, de la sucursal ni del token público.
- **Mínima exposición:** el servidor decide pantallas y opciones según el rol y envía a los Client Components solo los datos que van a mostrar. La interfaz sí muestra el nombre, el rol y la sucursal del propio usuario.

## Roles y permisos
Enum `Role`: `ADMIN_GENERAL`, `ADMIN_SUCURSAL`, `TECNICO`, `DEMO`. El **cliente no es un usuario** ni un valor de `Role`: no tiene cuenta y solo accede por enlace o QR.
- `DEMO` (jurado y visitantes): **solo lectura**. Ve las mismas pantallas y datos que `ADMIN_GENERAL`, pero toda mutación (Server Action o ruta de API distinta de `GET`) se rechaza **en `services/`** con el mensaje "La cuenta demo es de solo lectura." Ocultar botones en la interfaz no es suficiente. La interfaz muestra un aviso fijo "Modo demo · solo lectura" y deja visibles pero deshabilitados los botones de acción, para que se pueda recorrer el producto.
- **La demo nunca usa datos reales.** Corre en un despliegue y una rama de Neon separados (`DEMO_MODE=true`), con datos ficticios creados por `prisma/seed-demo.ts`. En ese modo, la vista pública de seguimiento también es de solo lectura (aprobar o rechazar cotizaciones queda deshabilitado). La cuenta `DEMO` no existe en producción.
- **Botón "Entrar como demo":** el jurado y los visitantes entran a la demo sin escribir credenciales.
  - Aparece en la pantalla de inicio de sesión **solo si `DEMO_MODE=true`**. Lo decide el servidor; el botón no se envía al navegador en otro caso.
  - Es un formulario sin campos que llama a una Server Action. La acción vuelve a comprobar `DEMO_MODE=true` (si no, responde con error y no hace nada), lee `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD` de las variables de entorno e inicia sesión **en el servidor** con Better Auth (`auth.api` con email y contraseña), que deja la cookie de sesión. Luego redirige al panel.
  - Las credenciales demo **nunca** se envían al navegador: ni en props, ni en campos ocultos, ni en el HTML, ni con `NEXT_PUBLIC_`. El usuario no las ve ni puede copiarlas.
  - La sesión demo sigue todas las reglas normales: el servidor carga el usuario y aplica el rol `DEMO` (solo lectura) en cada acción.
  - Si la cuenta demo no existe o está desactivada, se muestra "La demo no está disponible en este momento." sin revelar el motivo.
  - El botón es parte de la vitrina: va debajo del formulario normal, separado por "o", con el texto exacto "Entrar como demo" y una línea de ayuda "Recorre el sistema con datos de ejemplo, en solo lectura.".
- `ADMIN_GENERAL` (dueño): acceso total a todas las sucursales (con filtro opcional por sucursal), gestión de sucursales, personal, tarifas globales y marca (logo e ícono). Puede hacer todo lo que hace un `ADMIN_SUCURSAL` en cualquier sucursal.
- `ADMIN_SUCURSAL` (recepción / caja): solo opera y ve el detalle de las órdenes de su sucursal. En el historial global de un cliente, las órdenes de otras sucursales se muestran solo en resumen (número, sucursal, equipo, estado y fecha), sin acceso al detalle.
- `TECNICO`: pertenece a una sucursal; solo ve y actualiza las órdenes asignadas a su propio `id`. No accede a la sección de Clientes.
- En el cuadro de estados, "Administrador" es el `ADMIN_SUCURSAL` de la sucursal donde está la orden o el `ADMIN_GENERAL`.

## Reglas de negocio críticas
- **Máquina de estados:** las transiciones permitidas y el rol responsable de cada una se definen en **un solo lugar** (`services/`), según el cuadro de estados de `docs/prompt-1.md` (punto 17). Cualquier transición no listada se rechaza en el servidor. Los nombres de los estados se usan exactamente como en el cuadro (`INGRESADO`, `EN_DIAGNOSTICO`, `ESPERANDO_APROB_STA`, etc.).
- **Historial (auditoría):** todo cambio de estado, asignación de técnico, transferencia, cotización, aprobación o rechazo del cliente, resolución del STA y cobro se registra con usuario (o "cliente" en la vista pública), fecha y detalle, dentro de la misma transacción que el cambio. El historial no se edita ni se borra.
- **Número de orden:** correlativo independiente por sucursal con su prefijo (`TRU-000123`), generado de forma **atómica** con un contador por sucursal dentro de una transacción; nunca con `count() + 1`. El prefijo es de 3 letras mayúsculas y único.
- **Asignación:** solo se puede asignar un técnico **activo** de la **misma sucursal** de la orden.
- **Restricciones de personal:** un técnico solo puede desactivarse o cambiarse de sucursal si tiene **0 órdenes activas** (asignadas y no `ENTREGADO` ni `CERRADO_NOTA_CREDITO`).
- **Evidencias:** máximo 5 fotos por orden; valida en el servidor el tipo (JPEG, PNG o WebP) y el tamaño. Una vez creada la orden no se pueden eliminar ni reemplazar. El cliente nunca las ve.
- **Clientes:** son globales para toda la empresa. El DNI es único e inmutable; solo se editan WhatsApp y correo. El WhatsApp es obligatorio; el correo, opcional.
- **Transferencias:** no se permiten en órdenes `ENTREGADO` o `CERRADO_NOTA_CREDITO`, ni hacia la misma sucursal ni hacia sucursales desactivadas. La orden conserva número, estado, token e historial; se limpia el técnico asignado y se registran origen, destino, motivo, usuario y fecha.
- **Garantía de producto:** vigente si la fecha de ingreso no supera la fecha de compra más el plazo en meses. Si está vencida pasa a `EN_DIAGNOSTICO`, salvo una excepción aprobada por la marca que marca el administrador. Los trámites no extienden el plazo.
- **Garantía de servicio:** un reingreso por la misma falla dentro de los días configurados (60 por defecto) desde la entrega se vincula a la orden original, sin cobro de diagnóstico ni mano de obra; solo repuestos nuevos.
- **Tarifas:** un único registro global (diagnóstico mínimo, monto de gestión, días de garantía de servicio) que solo edita el `ADMIN_GENERAL`.
- **Liquidación:** se calcula siempre en el servidor según la tabla del punto 24 de `docs/prompt-1.md`; nunca se acepta un monto calculado en el navegador.

## Consulta pública del cliente
- La ruta usa un token largo y criptográficamente aleatorio (por ejemplo `crypto.randomUUID()` o cuid2), único por orden y distinto del número de orden. Nunca uses el correlativo en la URL.
- Muestra solo: estado en lenguaje sencillo (punto 26 de `docs/prompt-1.md`), equipo, cotización vigente, monto a pagar y datos de la sucursal actual. Nunca muestra fotos, DNI, notas internas, historial interno ni datos del personal.
- Aprobar o rechazar una cotización solo se permite si la orden está en `ESPERANDO_APROBACION` o `ESPERANDO_APROB_STA`. La acción es idempotente (no se puede aprobar dos veces), se valida con Zod y queda en el historial.

## Dinero, fechas e idioma
- **Dinero:** columnas `Decimal` (`@db.Decimal(10, 2)`), nunca `Float`. Muestra montos como `S/ 1,234.50` con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- **Fechas:** guarda en UTC y calcula y muestra en `America/Lima` (Vercel corre en UTC). Esto aplica a la vigencia de garantías, al plazo de 60 días y a la fecha de la orden.
- **Nombres en el código:** archivos, variables, funciones, modelos y columnas en **inglés** (`Branch`, `branchId`, `isActive`, `role`, `ServiceOrder`). Excepción: los valores de enums de dominio (roles y estados) se mantienen como en la documentación del cliente.
- **Interfaz:** todos los textos, etiquetas, correos y mensajes de error en **español (Perú)**.

## Convenciones de TypeScript y Next.js
- TypeScript estricto (`strict: true`). Prohibido `any`, `@ts-ignore` y `@ts-expect-error`.
- `params`, `searchParams`, `cookies()` y `headers()` son asíncronos y se resuelven con `await`.
- Valida con Zod todos los datos de entrada (formularios, Server Actions y rutas de API) antes de ejecutar lógica de negocio.

## Diseño, estilos y tema (Tailwind CSS 4 + variables CSS)

### Estrategia (95% Tailwind / 5% CSS global)
- Usa clases de **Tailwind** para toda la maquetación, espaciado, tipografía y estados interactivos.
- `app/globals.css` es el único archivo CSS. Contiene solo tokens de color, el variant `dark`, la página de impresión (`@page`) y estilos base de `body`. Prohibidos los `.module.css`, otros `.css` y `style={{}}` (salvo valores realmente dinámicos, como un ancho calculado).
- Tailwind 4 se configura **solo en CSS** (`@theme`), compilado con el loader `@tailwindcss/turbopack` de `next.config.ts`. No crees `tailwind.config.*` ni `postcss.config.*`.
- Las clases deben aparecer **completas y literales** en el código (`"bg-emerald-100"`), nunca construidas por concatenación (`` `bg-${color}-100` ``), porque Tailwind no las detecta.

### Tokens semánticos
Los colores de la interfaz salen siempre de estos tokens; no uses `bg-white`, `text-black`, `bg-zinc-*` ni colores fijos en componentes. Se definen en `:root` (claro) y `[data-theme="dark"]` (oscuro) y se exponen en `@theme inline`.

| Token | Clase de ejemplo | Uso |
| --- | --- | --- |
| `surface` | `bg-surface` | Fondo de la página |
| `card` | `bg-card` | Tarjetas, tablas, modales, formularios |
| `muted` | `bg-muted` | Fondos secundarios: cabeceras de tabla, hover de filas, inputs deshabilitados |
| `line` | `border-line`, `divide-line` | Bordes y separadores |
| `fg` | `text-fg` | Texto principal |
| `fg-muted` | `text-fg-muted` | Texto secundario, ayudas, placeholders |
| `accent` / `accent-hover` | `bg-accent hover:bg-accent-hover` | **Solo rellenos**: botón principal, chip o pestaña activa |
| `accent-fg` | `text-accent-fg` | Texto sobre `bg-accent` |
| `accent-ink` | `text-accent-ink`, `border-accent-ink`, `stroke-accent-ink` | Acento como texto, enlace, línea, ícono o barra de progreso sobre `surface`/`card`. Nunca uses `text-accent` ni `border-accent`: en tema claro el cian no llega a 3:1 |
| `danger` / `danger-fg` | `bg-danger text-danger-fg`, `text-danger` | Acciones destructivas y errores de validación |
| `ring` | `focus-visible:ring-ring` | Anillo de foco |

Si hace falta un token nuevo, agrégalo en `app/globals.css` con valor claro y oscuro (contraste AA) y en esta tabla; no lo resuelvas con un color fijo en el componente. Paleta elegida: **A · "Cian de osciloscopio"** (grafito frío + cian eléctrico). Los valores están en `app/globals.css` y todos los pares de la tabla cumplen AA en ambos temas.

### Modo oscuro (botón manual)
- El tema lo controla el atributo `data-theme="light" | "dark"` en `<html>`. El variant `dark:` está redefinido con `@custom-variant` sobre ese atributo y **solo en pantalla**: al imprimir nunca se aplica el tema oscuro.
- `app/layout.tsx` incluye en `<head>` el script en línea `themeInitScript` (`lib/theme.ts`). Lee la preferencia guardada en `localStorage` (clave `theme`) o, si no hay, el tema del sistema, y aplica el atributo **antes del primer pintado** (sin parpadeo). `<html>` lleva `suppressHydrationWarning`. Patrón tomado de `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.
- El botón es `components/theme-toggle.tsx` (Client Component). Cambia el atributo y guarda la preferencia. Va en la cabecera de la zona privada y de la vista pública. No dependas del tema en el render de React: los íconos se alternan solo con CSS (`dark:hidden` / `hidden dark:block`), sin estado, para evitar errores de hidratación.
- No guardes el tema en cookie ni lo leas con `cookies()`: con `cacheComponents` eso vuelve dinámico todo el layout.
- Con tokens, los componentes casi nunca necesitan `dark:`. Úsalo solo en los badges de estado.

### Badges de estado
- El mapa estado → etiqueta en español → clases vive **en un solo lugar**: `lib/order-status.ts`, y se renderiza con `components/order-status-badge.tsx`. Ninguna otra pantalla define colores o textos de estado.
- Forma base: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium`. El borde va en ambos modos para que el badge no cambie de tamaño.
- Patrón por color `c`: `bg-c-100 text-c-800 border-c-200 dark:bg-c-950/60 dark:text-c-300 dark:border-c-800`, escrito completo y literal para cada color.

| Grupo | Color | Estados |
| --- | --- | --- |
| Recibido | `slate` | `INGRESADO`, `INGRESADO_GARANTIA` |
| En proceso | `sky` | `EN_DIAGNOSTICO`, `EN_REPARACION`, `EVALUACION_GARANTIA`, `DERIVADO_A_SERVICIO` |
| Esperando al cliente | `amber` | `ESPERANDO_APROBACION`, `ESPERANDO_APROB_STA` |
| En la marca | `violet` | `ENVIADO_A_STA` |
| Prioridad (reingreso) | `orange` | `REINGRESO_GARANTIA_SERV` |
| Listo para recojo | `emerald` | `LISTO_PARA_ENTREGA`, `LISTO_ENTREGA_GARANTIA` |
| Finalizado | `zinc` | `ENTREGADO`, `CERRADO_NOTA_CREDITO` |

- El estado nunca se comunica solo por color: el badge siempre muestra su texto.
- La vista pública del cliente no muestra el código interno del estado: usa las etiquetas en lenguaje sencillo del punto 26 de `docs/prompt-1.md`, con los mismos colores.

### Impresión (comprobante en hoja A4)
- `@page { size: A4; margin: 12mm }` está definido en `app/globals.css`. El comprobante debe caber en **una sola hoja A4** vertical.
- La orden tiene una vista de impresión propia (botón "Imprimir" que llama a `window.print()`). Lo que no forma parte del comprobante (barra lateral, menús, botones, botón de tema, avisos) lleva `print:hidden`. Lo que solo debe salir en papel lleva `hidden print:block`. No crees clases como `.no-print`.
- Contenido mínimo, tomando como modelo `docs/orden-de-servicio-fisica.pdf`: datos de la sucursal (nombre, dirección, WhatsApp y horario), número de orden y fecha, tipo de ingreso (servicio técnico o garantía), datos del cliente, equipo (tipo, marca, modelo, serie), falla reportada, accesorios, estado físico y observaciones, código QR y enlace de seguimiento, y espacio para las firmas del cliente y de recepción. Si es garantía: comprobante de compra, fecha de compra y plazo. **Nunca imprime las fotos.**
- Al imprimir se usa siempre el tema claro (blanco y negro), aunque la pantalla esté en oscuro. Evita fondos de color en el comprobante; usa bordes y texto.
- El QR se renderiza en **SVG** (nunca en una imagen rasterizada pequeña) para que salga nítido, con un tamaño mínimo de 3 cm.
- Usa `break-inside-avoid` en bloques que no deben partirse.

### Tipografía, idioma y layout
- Fuente de interfaz: Geist (`font-sans`) y Geist Mono (`font-mono`, para números de orden, DNI y montos en tablas), cargadas con `next/font` en `app/layout.tsx`.
- Fuente de display (`font-display`): **Chakra Petch** (500, 600 y 700), **solo en los titulares de la vitrina** y en el texto del logo, cargada con `next/font/google`. Sus esquinas cortadas en ángulo hacen juego con el trazo del logo. Nunca en tablas, formularios ni en la zona privada. No declares otras fuentes.
- `<html lang="es-PE">`. Los títulos de página se definen con `metadata` usando la plantilla `"%s | CYM Servicio Técnico"`.
- **Mobile-first:** la vista pública se abre desde el celular (QR) y debe funcionar desde 360 px de ancho. La zona privada se usa en escritorio y tablet: desde `md:` las tablas, por debajo listas en tarjetas.

### Accesibilidad
- Contraste mínimo WCAG AA (4.5:1 en texto normal) en ambos temas.
- Todo elemento interactivo tiene foco visible: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface`.
- Áreas táctiles de al menos 44 × 44 px (`min-h-11`) en botones y enlaces de acción.
- Cada input tiene su `<label>`. Los errores de validación van debajo del campo en `text-danger`, en español, y se enlazan con `aria-describedby`.
- Botones que solo tienen ícono llevan `aria-label` en español.

### Componentes base y estados de la interfaz
- Las piezas repetidas viven en `components/ui/` (`button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`, `card.tsx`, `dialog.tsx`, `table.tsx`). Reutilízalas en vez de repetir clases; si falta una, créala ahí.
- Variantes de botón: `primary` (`bg-accent`), `secondary` (`bg-card border-line`), `danger` (`bg-danger`) y `ghost`.
- Cada pantalla contempla los estados de carga (`loading.tsx` o `<Suspense>` con esqueletos `animate-pulse bg-muted`, obligatorios con `cacheComponents` para datos dinámicos), vacío (mensaje en español y, si aplica, la acción para crear), error (`error.tsx` con mensaje en español y botón para reintentar) y deshabilitado.
- Los formularios deshabilitan el botón de envío mientras se procesan y muestran "Guardando…" (por ejemplo con `useFormStatus` o `useActionState`).
- **Sin librerías extra de UI:** nada de shadcn, Headless UI, librerías de íconos, `clsx` ni `tailwind-merge` sin autorización. Los íconos van como SVG en línea en `components/icons/`.

### Marca (logo provisional)
- No se usan los colores ni el logo original de CYM.
- **Isotipo "Señal"** (`components/brand/logo-mark.tsx`): un monitor dibujado con un solo trazo y, dentro, la línea de un osciloscopio que hace un pulso de diagnóstico y termina en un check. Cuenta el servicio: entra con una falla y sale resuelto.
  - El monitor va en `currentColor` y la señal en `accent-ink`. Al imprimir todo sale en negro (`print:stroke-current`).
  - Variante `full` desde 32 px y `compact` (pulso simplificado a un check, trazo más grueso) para 24 px o menos. El favicon es `app/icon.svg` (versión `compact`, se adapta al tema del sistema). El ícono de iPhone es `app/apple-icon.tsx`: genera un PNG de 180 × 180 con `ImageResponse` de `next/og`, con fondo grafito sólido porque iOS no acepta transparencia. Es la única excepción a la regla de no usar `style={{}}`, ya que `ImageResponse` solo admite estilos en línea.
  - Con `animated`, el logo se dibuja al montarse (monitor → señal → base) con `animate-logo-draw`. Solo en la vitrina y solo con `motion-safe:`.
- **Marca personalizable (HU-34 y HU-35, punto 27 de `docs/prompt-1.md`):** el `ADMIN_GENERAL` puede reemplazar el logo y el ícono desde "Configuración > Marca". Ningún otro rol la ve; `DEMO` la ve en solo lectura.
  - **Datos:** en el registro global de configuración (el mismo de las tarifas) se guardan `logoPublicId`, `iconPublicId` (ambos opcionales) y `showBrandName` (boolean, por defecto `true`). Si un `publicId` es `null`, se usa el predeterminado ("Señal"). Cada cambio y cada restauración queda en el historial de auditoría.
  - **Validación en el servidor (`services/`):** solo PNG o WebP, verificados por su contenido (bytes iniciales del archivo), no por la extensión ni por el `Content-Type` que manda el navegador. Logo: hasta 2 MB y mínimo 400 px de ancho. Ícono: cuadrado, mínimo 512 × 512 px y hasta 1 MB. **SVG prohibido** (puede contener scripts).
  - **Cloudinary:** subida firmada desde el servidor, entrega `authenticated` y URLs firmadas generadas en el servidor, como las fotos. Al reemplazar o restaurar, se borra de Cloudinary el archivo anterior.
  - **Render:** `components/brand/logo.tsx` recibe del servidor la URL firmada (o `null`) y `showBrandName`; nunca construye URLs en el cliente. Con logo propio, la imagen reemplaza al isotipo y el texto "CyM · COMPUTADORAS E INGENIERÍA" aparece solo si `showBrandName` es `true`. El `alt` es "CYM Computadoras e Ingeniería". En el comprobante A4 el logo se imprime en escala de grises (`print:grayscale`).
  - **Íconos:** `app/icon.svg` pasa a ser `app/icon.tsx` y `app/apple-icon.tsx` lee la configuración. Ambos generan el PNG desde el ícono propio o, si no hay, desde "Señal" (fondo grafito sólido para iOS).
  - **Caché:** como la marca no depende del usuario, su lectura puede usar `"use cache"` con `cacheTag("brand")`. La Server Action que guarda o restaura llama a `updateTag("brand")` (Next 16: invalida de inmediato, para que el administrador vea su cambio al instante; `revalidateTag` solo fuera de Server Actions). La URL firmada debe vencer **después** de que caduque la caché (`cacheLife`), para que nunca se sirva una URL vencida.
- **El logo como sistema:** la señal es un elemento de la interfaz, no solo del logo. La línea de progreso de la vista pública de seguimiento es la misma señal: cada estado de la orden es un tramo y, al llegar a "Listo para recojo", el trazo cierra en el check. Se dibuja en `accent-ink` con el mismo grosor y las mismas uniones redondeadas. No inventes otra barra de progreso.
- El logotipo completo (`components/brand/logo.tsx`) combina el isotipo con el texto **"CyM"** y, debajo, **"COMPUTADORAS E INGENIERÍA"**, escritos como texto HTML (nunca dentro del SVG). Así el texto se puede leer, seleccionar y adaptar.

### Movimiento y animación
- **Vitrina** = vista pública de seguimiento + inicio de sesión + aviso del modo demo. Es lo único que puede tener efectos llamativos. La zona privada usa el mismo lenguaje visual, sobrio y rápido.
- Fases 0–3: solo herramientas nativas (transiciones CSS, View Transitions de React/Next y animaciones ligadas al scroll en CSS).
- Fases 4–5: están autorizadas **Motion** (`motion`, import desde `motion/react`) y **GSAP** (`gsap` + `@gsap/react`), **solo en componentes de la vitrina**. Three.js, Lenis y otras librerías siguen requiriendo autorización.
- Toda animación respeta `prefers-reduced-motion` (con `motion-safe:` / `motion-reduce:` en Tailwind o `useReducedMotion`). Anima solo `transform` y `opacity`, nunca propiedades que fuercen el re-layout.
- Meta: Lighthouse ≥ 90 en rendimiento y accesibilidad, y ≥ 95 en buenas prácticas, en la vista pública y en el login.

## Fases de diseño (en paralelo a los 3 sprints)
Objetivo: concurso Awwwards, entrega el **7 de diciembre de 2026**. La landing page se hace en otro repositorio y está fuera de este proyecto. Cada fase debe quedar terminada y verificada antes de empezar la siguiente, y nunca se sacrifica funcionalidad del sprint por una fase de diseño.

| Fase | Sprint | Contenido | Criterio de salida |
| --- | --- | --- | --- |
| 0. Identidad | 1 | Paleta definitiva en tokens, fuente de display, isotipo y logotipo, favicon e ícono de app | Tokens con contraste AA verificado en ambos temas; logo legible a 16 px y en monocromo |
| 1. Sistema base | 1 | `components/ui/`, badges de estado, botón de tema, foco y accesibilidad | Todos los componentes en claro/oscuro, con teclado y estados (hover, foco, deshabilitado, error) |
| 2. Estructura | 1–3 | Layouts de la zona privada y de la vitrina; cada pantalla del sprint, funcional y sin adornos | La pantalla cumple sus criterios de aceptación, es responsive desde 360 px e imprime bien si aplica |
| 3. Microinteracciones | 2 | Hover y presión en botones, transiciones de cambio de estado, esqueletos de carga, confirmaciones | Sin saltos de diseño; respeta `prefers-reduced-motion` |
| 4. Movimiento | 3 | Transiciones entre páginas (View Transitions), animaciones de entrada en la vitrina, línea de tiempo animada del estado de la orden | Lighthouse ≥ 90 en rendimiento en la vitrina |
| 5. Vitrina | 3 | Momentos "hero" en el login y la vista pública (Motion/GSAP), modo demo pulido y datos demo creíbles | Recorrido completo con la cuenta `DEMO` sin errores; metas de Lighthouse cumplidas |

## Integración continua (GitHub Actions)
El CI ejecuta exactamente la **definición de terminado**: si pasa en local, debe pasar en el CI, y al revés. El CI **no despliega**: el despliegue lo hace la integración de Git de Vercel (vista previa en cada PR, producción al fusionar en `main`).

### Archivo y disparadores
- Un único workflow: `.github/workflows/ci.yml`, con nombre `CI` y un job `verify` en `ubuntu-latest`.
- Se ejecuta en `pull_request` hacia `main` y en `push` a `main`. No se ejecuta si el cambio solo toca `docs/**` (con `paths-ignore`, sin patrones de negación `!`). Los `.md` fuera de `docs/` (como `AGENTS.md`) sí lo disparan, para que el check obligatorio `CI / verify` se reporte en esos PR.
- `concurrency` por rama (`ci-${{ github.ref }}`) con `cancel-in-progress: true`, para que un push nuevo cancele la ejecución anterior.
- `timeout-minutes: 15`.

### Seguridad
- `permissions: contents: read` a nivel de workflow; ningún job pide más permisos.
- Las acciones de terceros se fijan por **SHA completo del commit**, con la versión en un comentario (`actions/checkout@<sha> # v5.x.x`), nunca por etiqueta móvil (`@v5`, `@main`). Al crear o actualizar el workflow, consulta la versión estable vigente de cada acción.
- **Sin secretos reales en el CI.** No se conecta a Neon, Cloudinary ni Better Auth de verdad. Las variables de entorno necesarias para compilar llevan valores ficticios declarados en el propio workflow (por ejemplo `BETTER_AUTH_SECRET: ci-dummy-secret-not-used-in-production`). Si algún paso necesita un secreto real, detente y pide autorización.
- El código no debe acceder a la base de datos ni a servicios externos durante `pnpm build`: las páginas con datos son dinámicas y quedan detrás de `<Suspense>`. Si el build falla por falta de conexión, el error está en el código, no en el CI.

### Entorno
- Node.js **24 (LTS)** con `actions/setup-node`, usando `cache: pnpm`.
- pnpm con `pnpm/action-setup`. La versión sale del campo `packageManager` de `package.json`; no la repitas en el workflow.
- `NEXT_TELEMETRY_DISABLED: 1` y `TZ: UTC`, para reproducir el entorno de Vercel y detectar errores de zona horaria (las fechas de negocio se calculan en `America/Lima`).
- Caché de `.next/cache` con `actions/cache`, con una clave que combine el hash de `pnpm-lock.yaml` y el de los archivos fuente.
- Servicio `postgres` (imagen oficial, versión mayor igual a la de Neon) con healthcheck. Solo se usa para validar migraciones y para pruebas de integración, nunca con datos reales.

### Pasos del job `verify` (en este orden; cualquier fallo detiene el job)
1. `actions/checkout`.
2. Configurar pnpm y Node (con caché del store).
3. `pnpm install --frozen-lockfile`. Falla si `pnpm-lock.yaml` no coincide con `package.json`; nunca uses `--no-frozen-lockfile` en el CI.
4. `pnpm prisma generate`.
5. **Migraciones:** `pnpm prisma migrate deploy` contra el Postgres del servicio, para comprobar que todas las migraciones se aplican desde cero. Después, `pnpm prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` (flags verificados en Prisma 7.10.1), que falla si hay cambios en el esquema sin migración. Los pasos de Prisma solo se ejecutan cuando existe `prisma/schema.prisma`.
6. `pnpm format:check`.
7. `pnpm lint`.
8. `pnpm typecheck`.
9. `pnpm test` (Vitest, con `DATABASE_URL` apuntando al Postgres del servicio para las pruebas de integración).
10. `pnpm build`.

### Scripts requeridos en `package.json`
| Script | Comando |
| --- | --- |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |
| `lint` | `eslint` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |
| `build` | `next build` |

La definición de terminado y el CI usan estos nombres. Si cambias uno, actualiza ambos.

### Reglas de trabajo
- `main` está protegida: solo se fusiona por PR y con el check `CI / verify` en verde. No se usa `--no-verify` ni se omiten pasos para que el CI pase.
- Si el CI falla, se corrige la causa. No se desactiva el paso, no se agregan `continue-on-error` ni se marcan pruebas como `skip` sin avisar al usuario.
- El desarrollo es en Windows y el CI corre en Linux. `.gitattributes` fija `* text=auto eol=lf` para evitar diferencias de fin de línea, y las rutas de importación deben respetar mayúsculas y minúsculas exactas, porque Linux las distingue.
- **Fuera del CI por ahora** (requieren autorización, porque agregan herramientas): Lighthouse CI para las metas de la vitrina, pruebas end-to-end con navegador y Dependabot o Renovate.

## Git
- Commits pequeños en español, en modo imperativo y con prefijo de tipo: `feat: registrar orden de servicio`, `fix: ...`, `chore: ...`.
- No hagas commit ni push sin que el usuario lo pida.
