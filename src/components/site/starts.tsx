import { useLocale, useTranslations } from "next-intl";
import { COURSES } from "@/lib/site/courses";
import { StartsBoard, type StartItem } from "./starts-board";

/** "15.12" in Russian, "15/12" in English. */
function shortDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** The next cohort of every course on a departure board, earliest first. */
export function Starts() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const courses = [...COURSES].sort((a, b) => a.start.localeCompare(b.start));
  const items: StartItem[] = courses.map((course) => {
    const name = t(`courses.items.${course.id}.name`);
    const date = shortDate(course.start, locale);
    return {
      id: course.id,
      name,
      date,
      months: t("starts.months", { count: course.months }),
      label: t("starts.item", { name, date, count: course.months }),
    };
  });

  return (
    <section aria-labelledby="starts-title" className="mx-auto max-w-6xl px-4 pt-16 pb-4 sm:px-6 sm:pt-20">
      <StartsBoard
        items={items}
        labels={{
          title: t("starts.title"),
          profession: t("starts.profession"),
          start: t("starts.start"),
          duration: t("starts.duration"),
          show: items.map((item) => t("starts.show", { name: item.name })),
        }}
      />
    </section>
  );
}
