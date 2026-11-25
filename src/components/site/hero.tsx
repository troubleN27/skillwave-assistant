import { useLocale, useTranslations } from "next-intl";
import { formatDayMonth, nextCohort } from "@/lib/site/courses";
import { AskButton } from "./ask-button";
import { button } from "./buttons";
import { HalftonePhoto } from "./halftone-photo";
import { InkSplat } from "./ink";

const nextStart = nextCohort();

export function Hero() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const startCourse = t(`courses.items.${nextStart.id}.name`);

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-12 md:pb-24">
        <div className="relative z-10">
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.9] font-black text-balance uppercase"
          >
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#courses" className={button.ink}>
              {t("chooseCourse")}
            </a>
            <AskButton className={button.inkOutline}>{t("askAssistant")}</AskButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg md:max-w-none">
          <InkSplat seed={41} className="absolute -top-14 -left-8 size-52 text-ink" />
          <InkSplat seed={9} className="absolute -right-6 -bottom-14 size-24 text-ink" />
          <HalftonePhoto
            src="/images/hero.jpg"
            alt={t("hero.photoAlt")}
            sizes="(min-width: 768px) 520px, 100vw"
            priority
            stock="paper"
            className="chamfer relative aspect-[4/3] [--chamfer:28px]"
            imageClassName="object-[70%_50%]"
          />
          {/* The clip-path lives on the inner block so it can't clip the focus ring. */}
          <a
            href="#courses"
            className="group absolute right-4 -bottom-6 rotate-[-6deg] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:right-8"
          >
            <span className="chamfer flex flex-col bg-ink px-5 py-3 text-sun [--chamfer:10px] group-hover:bg-ink-soft">
              <span className="text-xs font-bold text-sun/70">{t("hero.stamp")}</span>
              <span className="font-display text-2xl font-black uppercase">
                {formatDayMonth(nextStart.start, locale)}
              </span>
              <span className="text-xs font-semibold">{startCourse}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
