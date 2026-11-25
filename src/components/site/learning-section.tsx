import { useTranslations } from "next-intl";
import { HalftonePhoto } from "./halftone-photo";
import { InkSplat } from "./ink";
import { Section, SectionTitle } from "./section";

type Step = { title: string; text: string };

export function LearningSection() {
  const t = useTranslations("Site.learning");
  const steps = t.raw("steps") as Step[];

  return (
    <Section id="learning" labelledBy="learning-title">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <SectionTitle id="learning-title">{t("title")}</SectionTitle>
          <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-ink-soft">{t("subtitle")}</p>
          <div className="relative mt-10 hidden md:block">
            <InkSplat seed={58} className="absolute -top-10 -right-8 size-40 text-ink" />
            <HalftonePhoto
              src="/images/learning.jpg"
              alt={t("photoAlt")}
              sizes="(min-width: 768px) 440px, 0px"
              className="chamfer relative aspect-[4/3]"
            />
          </div>
        </div>

        <div>
          <ol className="grid">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3.25rem_1fr] gap-4 border-t-2 border-ink py-5">
                <span
                  aria-hidden
                  className="chamfer flex size-12 items-center justify-center bg-ink font-display text-2xl font-black text-sun [--chamfer:8px]"
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
