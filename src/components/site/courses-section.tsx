import { useLocale, useTranslations } from "next-intl";
import {
  COURSES,
  formatRub,
  formatStartDate,
  fullPaymentPrice,
  MAX_COURSE_MONTHS,
} from "@/lib/site/courses";
import { AskButton } from "./ask-button";

/**
 * Courses as rows: the bar length is the course duration, so the list doubles
 * as a comparison of how long each path takes.
 */
export function CoursesSection() {
  const t = useTranslations("Site.courses");
  const locale = useLocale();

  return (
    <section id="courses" className="scroll-mt-20 bg-indigo-50/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-slate-600">{t("subtitle")}</p>
        </div>

        <ul className="mt-10 grid gap-4">
          {COURSES.map((course) => {
            const name = t(`items.${course.id}.name`);
            return (
              <li
                key={course.id}
                className="grid gap-5 rounded-2xl border border-indigo-100 bg-white p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-10"
              >
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">{name}</h3>
                  <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-slate-600">
                    {t(`items.${course.id}.description`)}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-indigo-50 md:max-w-80"
                      role="img"
                      aria-label={t("months", { count: course.months })}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                        style={{ width: `${(course.months / MAX_COURSE_MONTHS) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-900">
                      {t("months", { count: course.months })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {t("start", { date: formatStartDate(course.start, locale) })},{" "}
                    {t("projects", { count: course.projects })}
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:items-end md:text-right">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                      {t("priceFrom", { price: formatRub(course.monthly, locale) })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t("fullPrice", { price: formatRub(fullPaymentPrice(course.price), locale) })}
                    </p>
                  </div>
                  <AskButton
                    question={t("askPrompt", { course: name })}
                    className="self-start rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-500 hover:bg-indigo-50 md:self-end"
                  >
                    {t("ask")}
                  </AskButton>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
