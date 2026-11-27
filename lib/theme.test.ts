import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, themeInitScript } from "@/lib/theme";

type FakeEnv = {
  stored: string | null;
  prefersDark: boolean;
};

/** Ejecuta el script en línea con un navegador simulado y devuelve el tema aplicado. */
function runScript({ stored, prefersDark }: FakeEnv): string | undefined {
  const attributes: Record<string, string> = {};
  const fakeWindow = {
    matchMedia: (query: string) => ({
      matches: prefersDark && query.includes("dark"),
    }),
  };
  const fakeLocalStorage = {
    getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null),
  };
  const fakeDocument = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        attributes[name] = value;
      },
    },
  };

  new Function("window", "localStorage", "document", themeInitScript)(
    fakeWindow,
    fakeLocalStorage,
    fakeDocument,
  );
  return attributes["data-theme"];
}

describe("themeInitScript", () => {
  it("aplica el tema guardado por el usuario", () => {
    expect(runScript({ stored: "dark", prefersDark: false })).toBe("dark");
    expect(runScript({ stored: "light", prefersDark: true })).toBe("light");
  });

  it("usa el tema del sistema si no hay preferencia guardada", () => {
    expect(runScript({ stored: null, prefersDark: true })).toBe("dark");
    expect(runScript({ stored: null, prefersDark: false })).toBe("light");
  });

  it("ignora valores guardados inválidos", () => {
    expect(runScript({ stored: "sepia", prefersDark: false })).toBe("light");
  });
});
