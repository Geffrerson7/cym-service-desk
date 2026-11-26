import { LogoMark } from "./logo-mark";

type LogoProps = {
  className?: string;
  /** Dibuja el isotipo al montarse (solo en la vitrina). */
  animated?: boolean;
};

/** Logotipo completo: isotipo "Señal" + "CyM" + "COMPUTADORAS E INGENIERÍA" como texto. */
export function Logo({ className, animated = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 text-fg ${className ?? ""}`}>
      <LogoMark className="h-10 w-auto shrink-0" animated={animated} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-2xl font-bold tracking-tight">CyM</span>
        <span className="mt-1 text-[0.625rem] font-medium tracking-[0.18em] text-fg-muted">
          COMPUTADORAS E INGENIERÍA
        </span>
      </span>
    </span>
  );
}
