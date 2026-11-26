import { useTranslations } from "next-intl";
import { COURSES } from "@/lib/site/courses";
import Image from "next/image";
import { Section, SectionTitle } from "./section";

export function TeachersSection() {
  const t = useTranslations("Site");

  return (
    <Section id="teachers" tone="ink" seed={64} labelledBy="teachers-title">
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
        <SectionTitle id="teachers-title">{t("teachers.title")}</SectionTitle>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-sun/80">{t("teachers.subtitle")}</p>
      </div>
      <ul data-anim="deal" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((course) => {
          const key = `teachers.items.${course.id}` as const;
          return (
            <li key={course.id}>
              {/* A staff pass: photo, name, course. */}
              <article className="flex h-full flex-col bg-paper text-ink">
                <div className="relative aspect-square border-b-[3px] border-ink">
                  <Image
                    src={`/images/teacher-${course.id}.jpg`}
                    alt={t(`${key}.photoAlt`)}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="self-start bg-ink px-2 py-0.5 text-xs font-bold text-sun">
                    {t(`courses.items.${course.id}.name`)}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-none font-black uppercase">{t(`${key}.name`)}</h3>
                  <p className="mt-1.5 text-sm font-semibold">
                    {t(`${key}.role`)}, {t("teachers.experience", { count: t.raw(`${key}.years`) as number })}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{t(`${key}.text`)}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
