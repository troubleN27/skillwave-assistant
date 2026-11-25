/** Site button styles: flat print blocks, no rounding. */
const base =
  "inline-flex h-12 items-center justify-center px-6 text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export const button = {
  /** Black block on yellow. */
  ink: `${base} bg-ink text-sun hover:bg-ink-soft focus-visible:outline-ink`,
  /** Outlined on yellow. */
  inkOutline: `${base} border-2 border-ink text-ink hover:bg-ink hover:text-sun focus-visible:outline-ink`,
  /** Yellow block on black. */
  sun: `${base} bg-sun text-ink hover:bg-paper focus-visible:outline-sun`,
  /** Outlined on black. */
  sunOutline: `${base} border-2 border-sun text-sun hover:bg-sun hover:text-ink focus-visible:outline-sun`,
};
