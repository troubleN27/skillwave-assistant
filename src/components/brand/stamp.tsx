import { cn } from "@/lib/utils";
import { MarkLines, splatPaths } from "./logo-mark";
import { STAMP_SPLAT } from "./splat-paths";

/**
 * The school's round stamp: an outer band with text along two arcs and the
 * logo splat in the middle. Black with yellow print by default; `inverted`
 * prints black on yellow. `id` must be unique on the page (it names the arcs).
 *
 * Geometry: the text band lies between r = 66 and r = 93. The top text sits on
 * a baseline at r = 73 and grows outward; the bottom arc runs left to right, so
 * its glyphs grow toward the centre from a baseline at r = 86.
 */
export function Stamp({
  id,
  top,
  bottom,
  inverted = false,
  className,
}: {
  id: string;
  top: string;
  bottom: string;
  inverted?: boolean;
  className?: string;
}) {
  const base = inverted ? "var(--color-sun)" : "var(--color-ink)";
  const print = inverted ? "var(--color-ink)" : "var(--color-sun)";
  const text = { fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 14.5, letterSpacing: 2.2, fill: print };

  return (
    <svg viewBox="0 0 200 200" className={cn("block", className)} aria-hidden focusable="false">
      <defs>
        <path id={`${id}-top`} d="M27,100 a73,73 0 0,1 146,0" />
        <path id={`${id}-bottom`} d="M14,100 a86,86 0 0,0 172,0" />
        <clipPath id={`${id}-core`}>
          <circle cx="100" cy="100" r="64" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill={base} />
      <circle cx="100" cy="100" r="93" fill="none" stroke={print} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="66" fill={base} stroke={print} strokeWidth="2.5" />
      <text style={text}>
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>
      <text style={text}>
        <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>
      <text x="20.5" y="104.5" fontSize="12" fill={print} textAnchor="middle">
        ✶
      </text>
      <text x="179.5" y="104.5" fontSize="12" fill={print} textAnchor="middle">
        ✶
      </text>
      <g clipPath={`url(#${id}-core)`}>
        <g transform="translate(36 36) scale(0.64)">
          <g fill={print}>
            {splatPaths(STAMP_SPLAT).map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g transform="translate(55 55) scale(0.9)">
            <MarkLines ink={base} dot={print} />
          </g>
        </g>
      </g>
    </svg>
  );
}
