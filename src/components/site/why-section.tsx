import { BriefcaseBusinessIcon, CalendarClockIcon, FolderKanbanIcon, MessagesSquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { key: "mentors", icon: MessagesSquareIcon },
  { key: "projects", icon: FolderKanbanIcon },
  { key: "career", icon: BriefcaseBusinessIcon },
  { key: "flexible", icon: CalendarClockIcon },
] as const;

export function WhySection() {
  const t = useTranslations("Site.why");

  return (
    <section id="why" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-xl text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {ITEMS.map(({ key, icon: Icon }) => (
            <div key={key} className="flex gap-4">
              <Icon className="mt-0.5 size-6 shrink-0 text-indigo-600" aria-hidden />
              <div>
                <h3 className="font-semibold text-slate-900">{t(`items.${key}.title`)}</h3>
                <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-slate-600">
                  {t(`items.${key}.text`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
