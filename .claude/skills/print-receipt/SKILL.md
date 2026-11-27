---
name: print-receipt
description: Reglas para la vista de impresión de la orden de servicio (comprobante en una hoja A4, QR en SVG, firmas, print:hidden). Úsala al crear o modificar la vista de impresión, el botón "Imprimir" o cualquier estilo print:.
---

# Impresión (comprobante en hoja A4)

- `@page { size: A4; margin: 12mm }` está definido en `app/globals.css`. El comprobante debe caber en **una sola hoja A4** vertical.
- La orden tiene una vista de impresión propia (botón "Imprimir" que llama a `window.print()`). Lo que no forma parte del comprobante (barra lateral, menús, botones, botón de tema, avisos) lleva `print:hidden`. Lo que solo debe salir en papel lleva `hidden print:block`. No crees clases como `.no-print`.
- Al imprimir se usa siempre el tema claro (blanco y negro), aunque la pantalla esté en oscuro: el variant `dark:` solo aplica en pantalla. Evita fondos de color en el comprobante; usa bordes y texto.
- El logo se imprime en negro (`print:stroke-current`) y, si es un logo propio, en escala de grises (`print:grayscale`).
- Usa `break-inside-avoid` en bloques que no deben partirse.

## Contenido mínimo

Toma como modelo `docs/orden-de-servicio-fisica.pdf`:

- Datos de la sucursal: nombre, dirección, WhatsApp y horario.
- Número de orden y fecha (en `America/Lima`).
- Tipo de ingreso: servicio técnico o garantía.
- Datos del cliente.
- Equipo: tipo, marca, modelo y serie.
- Falla reportada, accesorios, estado físico y observaciones.
- Código QR y enlace de seguimiento (con el token público, nunca el correlativo).
- Espacio para las firmas del cliente y de recepción.
- Si es garantía: comprobante de compra, fecha de compra y plazo.

**Nunca imprime las fotos.**

## QR

- Se renderiza en **SVG** (nunca en una imagen rasterizada pequeña) para que salga nítido, con un tamaño mínimo de 3 cm.
- Si hace falta una librería para generar el QR, pide autorización antes de agregarla.

## Verificación

- Revisa la vista previa de impresión del navegador en tema claro y en tema oscuro: ambas deben salir iguales, en una sola hoja.
