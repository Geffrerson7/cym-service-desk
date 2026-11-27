---
name: brand-settings
description: Marca personalizable (HU-34 y HU-35, punto 27 de docs/prompt-1.md) - subida y validación del logo y el ícono, Cloudinary, caché "brand", app/icon.tsx y app/apple-icon.tsx. Úsala al trabajar en "Configuración > Marca", en components/brand/logo.tsx con logo propio o en los íconos de la app.
---

# Marca personalizable

El `ADMIN_GENERAL` puede reemplazar el logo y el ícono desde "Configuración > Marca". Ningún otro rol la ve; `DEMO` la ve en solo lectura (los botones visibles pero deshabilitados y la mutación rechazada en `services/`).

## Datos

- En el registro global de configuración (el mismo de las tarifas) se guardan `logoPublicId`, `iconPublicId` (ambos opcionales) y `showBrandName` (boolean, por defecto `true`).
- Si un `publicId` es `null`, se usa el predeterminado ("Señal").
- Cada cambio y cada restauración queda en el historial de auditoría, dentro de la misma transacción.

## Validación en el servidor (`services/`)

- Solo PNG o WebP, verificados por su contenido (bytes iniciales del archivo), no por la extensión ni por el `Content-Type` que manda el navegador.
- Logo: hasta 2 MB y mínimo 400 px de ancho.
- Ícono: cuadrado, mínimo 512 × 512 px y hasta 1 MB.
- **SVG prohibido** (puede contener scripts).

## Cloudinary

- Subida firmada desde el servidor, entrega `authenticated` y URLs firmadas generadas en el servidor, como las fotos.
- Al reemplazar o restaurar, se borra de Cloudinary el archivo anterior.

## Render

- `components/brand/logo.tsx` recibe del servidor la URL firmada (o `null`) y `showBrandName`; nunca construye URLs en el cliente.
- Con logo propio, la imagen reemplaza al isotipo y el texto "CyM · COMPUTADORAS E INGENIERÍA" aparece solo si `showBrandName` es `true`. El `alt` es "CYM Computadoras e Ingeniería".
- En el comprobante A4 el logo se imprime en escala de grises (`print:grayscale`).

## Íconos

- `app/icon.svg` pasa a ser `app/icon.tsx` y `app/apple-icon.tsx` lee la configuración.
- Ambos generan el PNG desde el ícono propio o, si no hay, desde "Señal" (fondo grafito sólido para iOS, que no acepta transparencia).
- `ImageResponse` solo admite estilos en línea: es la única excepción a la regla de no usar `style={{}}`.

## Caché

- Como la marca no depende del usuario, su lectura puede usar `"use cache"` con `cacheTag("brand")`.
- La Server Action que guarda o restaura llama a `updateTag("brand")` (Next 16: invalida de inmediato, para que el administrador vea su cambio al instante; `revalidateTag` solo fuera de Server Actions). Confirma la API en `node_modules/next/dist/docs/` antes de usarla.
- La URL firmada debe vencer **después** de que caduque la caché (`cacheLife`), para que nunca se sirva una URL vencida.
