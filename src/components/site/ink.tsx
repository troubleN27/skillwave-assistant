import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Spray-paint decorations: photographed paint cut out to transparent PNGs in
   the header black (#121110). Plain images rather than CSS masks: masks are
   repainted on every animation frame. */

export const SPRAY_SPLAT = "/images/spray-splat.png";
const SPRAY_EDGE = "/images/spray-edge.png";

/** Turn and mirror for a splat, picked from a seed so every copy looks different. */
function splatPose(seed: number) {
  const turn = (seed * 137) % 360;
  return { turn, flip: seed % 2 === 1 };
}

/** A spray-paint splat. The seed sets its turn and whether it is mirrored. */
export function InkSplat({
  seed,
  className,
  style,
  ...rest
}: { seed: number; className?: string } & Omit<ComponentProps<"img">, "children" | "src" | "alt">) {
  const { turn, flip } = splatPose(seed);
  return (
    // Decorative: next/image would add nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPRAY_SPLAT}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("pointer-events-none block object-contain select-none", className)}
      style={{ rotate: `${turn}deg`, scale: flip ? "-1 1" : undefined, ...style }}
      {...rest}
    />
  );
}

/**
 * Spray paint running off a black block: under the header the paint hangs
 * down; `flip` turns it upside down for the top of the footer.
 */
export function InkEdge({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none h-[clamp(56px,7vw,130px)] overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPRAY_EDGE}
        alt=""
        draggable={false}
        className={cn("block h-full w-[max(100%,1100px)] max-w-none select-none", flip && "-scale-y-100")}
      />
    </div>
  );
}
