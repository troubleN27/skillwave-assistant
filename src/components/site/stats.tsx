import { useTranslations } from "next-intl";

type Stat = { value: string; label: string };

export function Stats() {
  const t = useTranslations("Site.stats");
  const items = t.raw("items") as Stat[];

  return (
    <section aria-labelledby="stats-title" className="mx-auto max-w-6xl px-4 pt-20 pb-6 sm:px-6 sm:pt-24">
      <h2 id="stats-title" className="sr-only">
        {t("title")}
      </h2>
      <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.value} className="border-t-4 border-ink pt-4">
            <dt className="sr-only">{item.label}</dt>
            <dd>
              <span data-count={item.value} className="block font-display text-[clamp(3rem,6vw,4.5rem)] leading-none font-black">
                {item.value}
              </span>
              <span className="mt-3 block max-w-[24ch] text-[15px] leading-snug text-ink-soft">{item.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
