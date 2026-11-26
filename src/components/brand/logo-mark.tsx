import { cn } from "@/lib/utils";
import { LOGO_SPLAT } from "./splat-paths";

/** Subpaths are drawn separately so overlapping drops never cut holes. */
export const splatPaths = (d: string) => d.split(/(?=M)/);

/**
 * The Skillwave mark — a smooth S (the "wave") breaking into a rising W chart
 * with an arrow (the "skill" that grows) — drawn in a 100×100 box.
 * `ink` is the line colour, `dot` fills the chart points.
 */
export function MarkLines({ ink, dot }: { ink: string; dot: string }) {
  return (
    <>
      <path
        d="M14 74 C 34 78, 36 56, 25 50 C 14 44, 16 24, 36 26 L 48 74 L 61 48 L 73 74 L 86 34"
        fill="none"
        stroke={ink}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill={dot} stroke={ink} strokeWidth="5">
        <circle cx="14" cy="74" r="6" />
        <circle cx="48" cy="74" r="6" />
        <circle cx="61" cy="48" r="6" />
        <circle cx="73" cy="74" r="6" />
      </g>
      <polygon points="92.2,15.1 95.9,39.4 74.9,32.6" fill={ink} />
    </>
  );
}

/**
 * Skillwave logo: the mark on an ink splat. Black splat with a yellow mark by
 * default; `inverted` gives a yellow splat with a black mark for dark backgrounds.
 */
export function LogoMark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  const splat = inverted ? "var(--color-sun)" : "var(--color-ink)";
  const mark = inverted ? "var(--color-ink)" : "var(--color-sun)";

  return (
    <svg viewBox="0 0 200 200" className={cn("shrink-0", className)} aria-hidden focusable="false">
      <g fill={splat}>
        {splatPaths(LOGO_SPLAT).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g transform="translate(55 55) scale(0.9)">
        <MarkLines ink={mark} dot={splat} />
      </g>
    </svg>
  );
}
