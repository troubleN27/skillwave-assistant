import { useTranslations } from "next-intl";
import { InkSplat } from "./ink";
import { Section, SectionTitle } from "./section";
import { WeekPlanner } from "./week-planner";

type Step = { title: string; text: string };

export function LearningSection() {
  const t = useTranslations("Site.learning");
  const steps = t.raw("steps") as Step[];

  return (
    <Section id="learning" labelledBy="learning-title">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
        {/* Pinned while the steps scroll by, on screens tall enough to show it whole. */}
        <div className="md:self-start [@media(min-height:870px)]:md:sticky [@media(min-height:870px)]:md:top-28">
          <SectionTitle id="learning-title">{t("title")}</SectionTitle>
          <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-ink-soft">{t("subtitle")}</p>
          <div className="relative mt-10 pr-2 md:mt-8 md:pr-0">
            <InkSplat seed={58} data-anim="splat" className="absolute -top-12 -right-6 size-32 md:-top-14 md:-right-12 md:size-44" />
            <WeekPlanner />
          </div>
        </div>

        <div>
          <ol data-anim="deal" className="grid">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3.25rem_1fr] gap-4 border-t-2 border-ink py-5">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center bg-ink font-display text-2xl font-black text-sun"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl font-black uppercase">{step.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="border-t-2 border-b-2 border-ink py-5 font-semibold">{t("pause")}</p>
        </div>
      </div>
    </Section>
  );
}
