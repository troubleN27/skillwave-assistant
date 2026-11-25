import { cn } from "@/lib/utils";

/**
 * Skillwave mark: on a chamfered plate, a smooth S (the "wave") breaks into a
 * rising W chart with an arrow (the "skill" that grows).
 * `inverted` swaps plate and ink for use on black backgrounds.
 */
export function LogoMark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  const plate = inverted ? "var(--color-sun)" : "var(--color-ink)";
  const ink = inverted ? "var(--color-ink)" : "var(--color-sun)";

  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} aria-hidden focusable="false">
      <polygon points="18,0 82,0 100,18 100,82 82,100 18,100 0,82 0,18" fill={plate} />
      <path
        d="M14 74 C 34 78, 36 56, 25 50 C 14 44, 16 24, 36 26 L 48 74 L 61 48 L 73 74 L 86 34"
        fill="none"
        stroke={ink}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill={plate} stroke={ink} strokeWidth="5">
        <circle cx="14" cy="74" r="6" />
        <circle cx="48" cy="74" r="6" />
        <circle cx="61" cy="48" r="6" />
        <circle cx="73" cy="74" r="6" />
      </g>
      <polygon points="92.2,15.1 95.9,39.4 74.9,32.6" fill={ink} />
    </svg>
  );
}
