import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Day = { day: string; text: string; note: string; live?: boolean; done?: boolean; off?: boolean };

/**
 * A sample study week as a paper planner taped to the page, in the same series
 * as the hero receipt and the certificate. Facts come from the knowledge base
 * (webinar days of the Frontend course, lesson lengths, the 48-hour review).
 */
export function WeekPlanner() {
  const t = useTranslations("Site");
  const days = t.raw("learning.week.days") as Day[];

  return (
    <figure className="relative mx-auto w-full max-w-[440px] pt-4">
      {/* Black tape holding the sheet. */}
      <span aria-hidden className="absolute top-0 left-1/2 z-10 h-7 w-32 -translate-x-1/2 -rotate-3 bg-ink" />
      <div className="rotate-[-1.5deg] bg-white shadow-[8px_8px_0_var(--color-ink)]">
        <div className="flex items-baseline justify-between gap-3 bg-ink px-5 py-2.5 text-sun">
          <figcaption className="font-display text-lg leading-none font-black uppercase">
            {t("learning.week.title")}
          </figcaption>
          <span className="text-right text-xs font-bold text-sun/80">
            {t("learning.week.course", { course: t("courses.items.frontend.name") })}
          </span>
        </div>

        <ol aria-label={t("learning.week.label")} className="px-5 py-2">
          {days.map((d) => (
            <li
              key={d.day}
              className={cn(
                "grid grid-cols-[2.6rem_1fr] items-baseline gap-3 border-b border-dashed border-ink/30 py-1.5 last:border-b-0",
                d.off && "text-ink-soft/70",
              )}
            >
              <span className="font-display text-base font-black uppercase">{d.day}</span>
              <span className="text-sm leading-snug">
                <span
                  className={cn(
                    "font-semibold",
                    d.live && "bg-[linear-gradient(transparent_45%,var(--color-sun)_45%,var(--color-sun)_92%,transparent_92%)] px-0.5",
                    d.off && "line-through decoration-ink/40",
                  )}
                >
                  {d.text}
                </span>
                {d.note && <span className="text-xs font-bold text-ink-soft"> · {d.note}</span>}
                {d.done && (
                  <span
                    aria-hidden
                    className="ml-2 inline-block -rotate-6 border-2 border-ink px-1.5 align-middle font-display text-[10px] leading-4 font-black text-ink uppercase"
                  >
                    ✓ {t("learning.week.stamp")}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>

        <p className="border-t-2 border-ink px-5 py-2.5 text-sm font-extrabold">{t("learning.week.hours")}</p>
      </div>
    </figure>
  );
}
