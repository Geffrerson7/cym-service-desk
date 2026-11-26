export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/**
 * Script en línea para <head>: aplica el tema guardado (o el del sistema)
 * antes del primer pintado, para evitar el parpadeo al cargar.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
