import { useTranslations } from "next-intl";
import { AskButton } from "./ask-button";
import { button } from "./buttons";
import { HeroReceipt } from "./hero-receipt";
import { InkSplat } from "./ink";

/** Hidden in the server HTML; the entrance animation reveals it (see MotionRoot). */
const hiddenUntilAnimated = { "data-hero-hidden": true, style: { visibility: "hidden" } } as const;

export function Hero() {
  const t = useTranslations("Site");

  return (
    <section aria-labelledby="hero-title" className="relative">
      {/* Two big spray splats at the page edges, behind the content. */}
      <InkSplat
        seed={4}
        data-hero-splat
        {...hiddenUntilAnimated}
        className="absolute top-[41%] -left-24 w-40 sm:w-56 md:top-auto md:-bottom-6 md:-left-28 md:w-[clamp(240px,22vw,340px)]"
      />
      <InkSplat
        seed={7}
        data-hero-splat
        {...hiddenUntilAnimated}
        className="absolute -right-14 bottom-28 w-44 sm:w-60 md:-right-24 md:bottom-0 md:w-[clamp(260px,24vw,380px)]"
      />
      {/* Safety net: if the entrance animation hasn't started in 2.5 s (slow network,
          no JavaScript), a CSS animation shows the hidden elements anyway. */}
      <style>{"@keyframes hero-reveal{to{visibility:visible}}[data-hero-hidden]{animation:hero-reveal 0s 2.5s forwards}"}</style>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-20 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-28 md:pb-24">
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
            <a href="#courses" className={button.ink}>
              {t("chooseCourse")}
            </a>
            <AskButton className={button.inkOutline}>
              {t("askAssistant")}
            </AskButton>
          </div>
        </div>

        <div className="relative">
          <HeroReceipt hiddenProps={hiddenUntilAnimated} />
        </div>
      </div>
    </section>
  );
}
