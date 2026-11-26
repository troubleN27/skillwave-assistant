import { useTranslations } from "next-intl";
import { HalftonePhoto } from "./halftone-photo";
import { Section, SectionTitle } from "./section";

export function CareerSection() {
  const t = useTranslations("Site.career");
  const points = t.raw("points") as string[];

  return (
    <Section labelledBy="career-title">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <HalftonePhoto
          src="/images/career.jpg"
          alt={t("photoAlt")}
          sizes="(min-width: 768px) 560px, 100vw"
          className="aspect-[4/3] md:order-2"
          imageClassName="object-[45%_50%]"
        />
        <div>
          <SectionTitle id="career-title">{t("title")}</SectionTitle>
          <p className="mt-5 max-w-[48ch] text-[17px] leading-relaxed text-ink-soft">{t("text")}</p>
          <ul className="mt-6 grid gap-3">
            {points.map((point) => (
              <li key={point} className="flex gap-3 font-semibold">
                <span aria-hidden className="mt-2 size-2.5 shrink-0 bg-ink" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-l-4 border-ink pl-4 leading-relaxed">{t("certificate")}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t("note")}</p>
        </div>
      </div>
    </Section>
  );
}
