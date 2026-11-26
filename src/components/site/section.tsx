import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A page section on yellow paper, or a black block with straight edges (`tone="ink"`). */
export function Section({
  id,
  tone = "sun",
  labelledBy,
  className,
  children,
}: {
  id?: string;
  tone?: "sun" | "ink";
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  const ink = tone === "ink";
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative scroll-mt-20">
      <div className={cn(ink ? "bg-ink text-sun" : "text-ink")}>
        <div className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)}>{children}</div>
      </div>
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
