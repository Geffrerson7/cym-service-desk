type LogoMarkProps = {
  className?: string;
  /** Texto accesible. Omítelo cuando el isotipo va junto al nombre (decorativo). */
  title?: string;
  /** `full` desde 32 px; `compact` (pulso simplificado a check) para 24 px o menos. */
  variant?: "full" | "compact";
  /** Dibuja el logo al montarse. Solo en la vitrina; respeta prefers-reduced-motion. */
  animated?: boolean;
};

/*
 * Isotipo "Señal": un monitor de un solo trazo y, dentro, la línea de un
 * osciloscopio que hace un pulso de diagnóstico y termina en un check.
 * Monitor en currentColor; señal en accent-ink (monocromo al imprimir).
 */
const PATHS = {
  full: {
    strokeWidth: 4,
    signal: "M12 24H20L24 15L29 32L33 24H36L40 28L51 16",
  },
  compact: {
    strokeWidth: 6,
    signal: "M13 24H21L29 32L50 13",
  },
} as const;

const DRAW =
  "motion-safe:[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:animate-logo-draw";

export function LogoMark({
  className,
  title,
  variant = "full",
  animated = false,
}: LogoMarkProps) {
  const { strokeWidth, signal } = PATHS[variant];
  const decorative = !title;
  const draw = (delay: string) => (animated ? `${DRAW} ${delay}` : "");

  return (
    <svg
      viewBox="0 0 64 56"
      className={className}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="38"
        rx={variant === "full" ? 7 : 8}
        pathLength={1}
        className={`stroke-current ${draw("")}`}
      />
      <path
        d={signal}
        pathLength={1}
        className={`stroke-accent-ink print:stroke-current ${draw("motion-safe:[animation-delay:700ms]")}`}
      />
      <path
        d="M24 52H40"
        pathLength={1}
        className={`stroke-current ${draw("motion-safe:[animation-delay:1200ms]")}`}
      />
    </svg>
  );
}
