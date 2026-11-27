/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  // Valores por defecto de Prettier (comillas dobles, punto y coma, 80 columnas),
  // que ya son el estilo del proyecto.
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind 4: el plugin lee el tema (tokens, variant dark) desde este CSS.
  tailwindStylesheet: "./app/globals.css",
};

export default config;
