import { useLocale, useTranslations } from "next-intl";
import { COURSES, formatRub, formatStartDate, fullPaymentPrice } from "@/lib/site/courses";
import { CourseTicket, type CourseTicketData } from "./course-ticket";
import { Section, SectionTitle } from "./section";

export function CoursesSection() {
  const t = useTranslations("Site.courses");
  const site = useTranslations("Site");
  const locale = useLocale();

  const tickets: CourseTicketData[] = COURSES.map((course) => {
    const key = `items.${course.id}` as const;
    return {
      id: course.id,
      name: t(`${key}.name`),
      description: t(`${key}.description`),
      audience: t(`${key}.audience`),
      schedule: t(`${key}.schedule`),
      workload: t(`${key}.workload`),
      modules: t.raw(`${key}.modules`) as string[],
      projectList: t.raw(`${key}.projectList`) as string[],
      duration: t("months", { count: course.months }),
      projects: t("projects", { count: course.projects }),
      start: t("start", { date: formatStartDate(course.start, locale) }),
      monthly: t("monthly", { price: formatRub(course.monthly, locale) }),
      fullPrice: formatRub(course.price, locale),
      payNowPrice: formatRub(fullPaymentPrice(course.price), locale),
      askPrompt: t("askPrompt", { course: t(`${key}.name`) }),
    };
  });

  const labels = {
    details: t("details"),
    close: t("close"),
    audience: t("audience"),
    program: t("program"),
    portfolio: t("portfolio"),
    schedule: t("schedule"),
    workload: t("workload"),
    price: t("price"),
    fullPrice: t("fullPrice"),
    payNow: t("payNow"),
    installments: t("installments"),
    leaveRequest: site("leaveRequest"),
    askAssistant: site("askAssistant"),
  };

  return (
    <Section id="courses" tone="ink" labelledBy="courses-title">
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
        <SectionTitle id="courses-title">{t("title")}</SectionTitle>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-sun/80">{t("subtitle")}</p>
      </div>
      <ul data-anim="deal" className="mt-12 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-14">
        {tickets.map((ticket, i) => (
          <li key={ticket.id} className={i % 2 ? "lg:translate-y-6" : undefined}>
            <CourseTicket course={ticket} labels={labels} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
