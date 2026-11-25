import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TornEdge } from "./ink";

/**
 * A page section. Black sections get torn ink edges: a ragged top where the
 * ink meets the yellow paper, and drips running down from the bottom.
 */
export function Section({
  id,
  tone = "sun",
  seed = 1,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  tone?: "sun" | "ink";
  seed?: number;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  const ink = tone === "ink";
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative scroll-mt-20">
      {ink && <TornEdge seed={seed} side="top" drips={false} className="-mb-px text-ink" />}
      <div className={cn(ink ? "bg-ink text-sun" : "text-ink")}>
        <div className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)}>{children}</div>
      </div>
      {ink && <TornEdge seed={seed + 100} className="-mt-px text-ink" />}
    </section>
  );
}

/** Section heading: poster-style display type. */
export function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      data-anim="stamp"
      className={cn(
        "font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-[0.95] font-black uppercase",
        className,
      )}
    >
      {children}
    </h2>
  );
}
