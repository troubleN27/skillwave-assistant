import { cn } from "@/lib/utils";

/* Printed-ink decorations. Shapes are generated from a seed, so server and
   client render the same markup and every splat can look different. */

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

/** Closed smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smoothClosedPath(points: [number, number][]) {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n];
  let d = `M${round(at(0)[0])} ${round(at(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return `${d} Z`;
}

function splatShape(seed: number) {
  const rnd = random(seed);
  const points: [number, number][] = [];
  const count = 30;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.12;
    let radius = 44 + rnd() * 14;
    if (rnd() < 0.2) radius += 18 + rnd() * 26; // a splash arm
    points.push([100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius]);
  }
  const drops = Array.from({ length: 12 + Math.floor(rnd() * 6) }, () => {
    const angle = rnd() * Math.PI * 2;
    const distance = 66 + rnd() * 30;
    return {
      cx: round(100 + Math.cos(angle) * distance),
      cy: round(100 + Math.sin(angle) * distance),
      r: round(1.2 + (1 - (distance - 66) / 30) * 4.5 * rnd() + 0.8),
    };
  });
  return { body: smoothClosedPath(points), drops };
}

/** An ink splat. Colour comes from `currentColor`. */
export function InkSplat({ seed, className }: { seed: number; className?: string }) {
  const { body, drops } = splatShape(seed);
  return (
    <svg viewBox="0 0 200 200" className={cn("pointer-events-none", className)} aria-hidden focusable="false">
      <g fill="currentColor">
        <path d={body} />
        {drops.map((drop, i) => (
          <circle key={i} {...drop} />
        ))}
      </g>
    </svg>
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
