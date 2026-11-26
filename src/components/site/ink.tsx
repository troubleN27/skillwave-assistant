import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Printed-ink decorations. Splats and the header edge are photographed ink;
   section edges are generated from a seed, so server and client render the
   same markup. */

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

/* Photographed black ink, cut out to transparent PNGs. Plain images rather
   than CSS masks: masks are repainted on every animation frame. */
export const INK_SPLATS = ["/images/ink-splat-1.png", "/images/ink-splat-2.png", "/images/ink-splat-3.png"];

/** A black ink splat; the seed picks the shape and its turn. */
export function InkSplat({
  seed,
  className,
  style,
  ...rest
}: { seed: number; className?: string } & Omit<ComponentProps<"img">, "children" | "src" | "alt">) {
  const turn = Math.round(random(seed)() * 360);
  return (
    // Decorative and tiny: next/image would add nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={INK_SPLATS[seed % INK_SPLATS.length]}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("pointer-events-none block object-contain select-none", className)}
      style={{ rotate: `${turn}deg`, ...style }}
      {...rest}
    />
  );
}

/** Black paint dripping from under the site header. */
export function InkEdge({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none h-[clamp(72px,8vw,150px)] overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ink-edge.png" alt="" draggable={false} className="block h-full w-[max(100%,1100px)] max-w-none select-none" />
    </div>
  );
}

const EDGE_WIDTH = 1200;

function tornEdgePath(seed: number, height: number, drips: boolean) {
  const rnd = random(seed);
  const base = 10;
  let d = `M0 0 H${EDGE_WIDTH} V${base}`;
  let x = EDGE_WIDTH;
  while (x > 0) {
    x = Math.max(0, x - (8 + rnd() * 14));
    const y = base + (rnd() - 0.5) * 8;
    if (drips && rnd() < 0.09 && x > 20) {
      // An ink drip: narrow lobe running down with a rounded end.
      const width = 4 + rnd() * 6;
      const length = 8 + rnd() * (height - base - 14);
      d += ` L${round(x + width / 2)} ${round(y)}`;
      d += ` L${round(x + width / 2 - 0.8)} ${round(y + length)}`;
      d += ` Q${round(x)} ${round(y + length + width)} ${round(x - width / 2 + 0.8)} ${round(y + length)}`;
      d += ` L${round(x - width / 2)} ${round(y)}`;
    } else {
      d += ` L${round(x)} ${round(y)}`;
    }
  }
  return `${d} Z`;
}

/**
 * Ragged ink edge with drips, filled with `currentColor`. Place it right
 * under a black block (`side="bottom"`) or right above one (`side="top"`).
 */
export function TornEdge({
  seed,
  side = "bottom",
  drips = true,
  className,
}: {
  seed: number;
  side?: "top" | "bottom";
  /** Drips only make sense when the ink runs downward. */
  drips?: boolean;
  className?: string;
}) {
  const height = 36;
  return (
    <svg
      viewBox={`0 0 ${EDGE_WIDTH} ${height}`}
      preserveAspectRatio="none"
      className={cn("pointer-events-none block h-7 w-full sm:h-9", side === "top" && "-scale-y-100", className)}
      aria-hidden
      focusable="false"
    >
      <path d={tornEdgePath(seed, height, drips)} fill="currentColor" />
    </svg>
  );
}
