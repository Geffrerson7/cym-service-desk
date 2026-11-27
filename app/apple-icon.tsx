import { ImageResponse } from "next/og";

/*
 * Ícono para iPhone/iPad (apple-touch-icon), generado como PNG en el build.
 * iOS no acepta SVG, rellena la transparencia con negro y redondea las
 * esquinas por su cuenta: por eso fondo sólido grafito y sin bordes propios.
 * ImageResponse solo admite estilos en línea (excepción a la regla de Tailwind).
 * Colores: paleta A en tema oscuro (fondo surface, monitor fg, señal accent).
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0f13",
      }}
    >
      <svg
        width="116"
        height="116"
        viewBox="0 -4 64 64"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="56" height="38" rx="8" stroke="#e6edf2" />
        <path d="M13 24H21L29 32L50 13" stroke="#22d3ee" />
        <path d="M24 52H40" stroke="#e6edf2" />
      </svg>
    </div>,
    { ...size },
  );
}
