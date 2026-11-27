---
name: demo-mode
description: Modo demo para el jurado y los visitantes - botón "Entrar como demo", Server Action de inicio de sesión demo, prisma/seed-demo.ts, aviso "Modo demo · solo lectura" y vista pública en solo lectura. Úsala al trabajar en el login, en DEMO_MODE, en la cuenta DEMO o en los datos ficticios.
---

# Modo demo

Reglas que siempre aplican (también están en `AGENTS.md`): el rol `DEMO` es de solo lectura y la mutación se rechaza en `services/` con "La cuenta demo es de solo lectura."; la demo nunca usa datos reales; las credenciales demo nunca llegan al navegador.

## Despliegue y datos

- Corre en un despliegue y una rama de Neon separados (`DEMO_MODE=true`), con datos ficticios creados por `prisma/seed-demo.ts`. La cuenta `DEMO` no existe en producción.
- `prisma/seed-demo.ts` es idempotente, crea la cuenta con `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD` y solo corre si `DEMO_MODE=true`.
- Los datos demo deben ser creíbles (fase 5): varias sucursales, órdenes en todos los estados del cuadro, garantías vigentes y vencidas, un reingreso por garantía de servicio y nombres, DNI y teléfonos claramente ficticios.
- En modo demo, la vista pública de seguimiento también es de solo lectura: aprobar o rechazar cotizaciones queda deshabilitado (y rechazado en el servidor).

## Botón "Entrar como demo"

- Aparece en la pantalla de inicio de sesión **solo si `DEMO_MODE=true`**. Lo decide el servidor; el botón no se envía al navegador en otro caso.
- Es un formulario sin campos que llama a una Server Action. La acción:
  1. Vuelve a comprobar `DEMO_MODE=true`. Si no, responde con error y no hace nada.
  2. Lee `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD` de las variables de entorno.
  3. Inicia sesión **en el servidor** con Better Auth (`auth.api` con email y contraseña), que deja la cookie de sesión.
  4. Redirige al panel.
- Las credenciales demo **nunca** se envían al navegador: ni en props, ni en campos ocultos, ni en el HTML, ni con `NEXT_PUBLIC_`.
- La sesión demo sigue todas las reglas normales: el servidor carga el usuario y aplica el rol `DEMO` en cada acción.
- Si la cuenta demo no existe o está desactivada, se muestra "La demo no está disponible en este momento." sin revelar el motivo.

## Interfaz

- El botón es parte de la vitrina: va debajo del formulario normal, separado por "o", con el texto exacto "Entrar como demo" y la línea de ayuda "Recorre el sistema con datos de ejemplo, en solo lectura.".
- En la zona privada se muestra un aviso fijo "Modo demo · solo lectura" (`print:hidden`) y los botones de acción quedan visibles pero deshabilitados, para que se pueda recorrer el producto.

## Pruebas

- Prueba en `services/` que cada mutación con un usuario `DEMO` devuelve `{ ok: false, error: "La cuenta demo es de solo lectura." }` sin tocar la base.
