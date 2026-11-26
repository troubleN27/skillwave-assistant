import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/** Mark + SKILLWAVE / ACADEMY lockup. `inverted` is for black backgrounds. */
export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        inverted ? "text-sun" : "text-ink",
        className,
      )}
    >
      <LogoMark inverted={inverted} className="-my-2 size-14" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-black tracking-[0.01em]">SKILLWAVE</span>
        <span className="mt-1 text-[9.5px] font-extrabold tracking-[0.42em]">ACADEMY</span>
      </span>
      <span className="sr-only">Skillwave Academy</span>
    </span>
  );
}
