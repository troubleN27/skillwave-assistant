import { useLocale, useTranslations } from "next-intl";
import { formatDayMonth, nextCohort } from "@/lib/site/courses";
import { AskButton } from "./ask-button";
import { button } from "./buttons";
import { HalftonePhoto } from "./halftone-photo";
import { InkSplat } from "./ink";

const nextStart = nextCohort();

/** Hidden in the server HTML; the entrance animation reveals it (see MotionRoot). */
const hiddenUntilAnimated = { "data-hero-hidden": true, style: { visibility: "hidden" } } as const;

export function Hero() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const startCourse = t(`courses.items.${nextStart.id}.name`);

  return (
    <section aria-labelledby="hero-title" className="relative">
      {/* Safety net: if the entrance animation hasn't started in 2.5 s (slow network,
          no JavaScript), a CSS animation shows the hidden elements anyway. */}
      <style>{"@keyframes hero-reveal{to{visibility:visible}}[data-hero-hidden]{animation:hero-reveal 0s 2.5s forwards}"}</style>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-12 md:pb-24">
        <div className="relative z-10">
          <h1
            id="hero-title"
            data-hero-title
            {...hiddenUntilAnimated}
            className="font-display text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.9] font-black text-balance uppercase"
          >
            {t("hero.title")}
          </h1>
          <p data-hero-fade {...hiddenUntilAnimated} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft">{t("hero.subtitle")}</p>
          <div data-hero-fade {...hiddenUntilAnimated} className="mt-8 flex flex-wrap gap-3">
            <a href="#courses" data-splash className={button.ink}>
              {t("chooseCourse")}
            </a>
            <AskButton data-splash className={button.inkOutline}>
              {t("askAssistant")}
            </AskButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg md:max-w-none">
          <InkSplat seed={41} data-hero-splat {...hiddenUntilAnimated} className="absolute -top-14 -left-8 size-52 text-ink" />
          <InkSplat seed={9} data-hero-splat {...hiddenUntilAnimated} className="absolute -right-6 -bottom-14 size-24 text-ink" />
          <div data-hero-photo {...hiddenUntilAnimated} className="relative">
            <HalftonePhoto
              src="/images/hero.jpg"
              alt={t("hero.photoAlt")}
              sizes="(min-width: 768px) 520px, 100vw"
              priority
              stock="paper"
              className="relative aspect-[4/3]"
              imageClassName="object-[70%_50%]"
            />
          </div>
          {/* The clip-path lives on the inner block so it can't clip the focus ring. */}
          <a
            href="#courses"
            data-hero-stamp
            {...hiddenUntilAnimated}
            className="group absolute right-4 -bottom-6 rotate-[-6deg] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:right-8"
          >
            <span className="flex flex-col bg-ink px-5 py-3 text-sun group-hover:bg-ink-soft">
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
