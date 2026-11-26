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
      {/* Safety net: if the entrance animation hasn't started in 2.5 s (slow network,
          no JavaScript), a CSS animation shows the hidden elements anyway. */}
      <style>{"@keyframes hero-reveal{to{visibility:visible}}[data-hero-hidden]{animation:hero-reveal 0s 2.5s forwards}"}</style>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-20 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-28 md:pb-24">
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

        <div className="relative">
          <InkSplat seed={9} data-hero-splat {...hiddenUntilAnimated} className="absolute -bottom-10 left-2 size-28 text-ink sm:left-10" />
          <HeroReceipt hiddenProps={hiddenUntilAnimated} />
        </div>
      </div>
    </section>
  );
}
