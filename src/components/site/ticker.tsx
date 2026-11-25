import { useTranslations } from "next-intl";

/** A slanted strip of black tape with the school's key facts running along it. */
export function Ticker() {
  const t = useTranslations("Site");
  const items = t.raw("ticker") as string[];
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-display text-xl font-bold uppercase sm:text-2xl">{item}</span>
          <span className="text-sun/60" aria-hidden>
            ✶
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative z-10 -rotate-2 bg-ink py-3 text-sun shadow-[0_6px_0_rgba(18,17,16,0.15)]">
      <div className="ticker-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
