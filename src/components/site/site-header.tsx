import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AskButton } from "./ask-button";
import { Logo } from "./logo";

export function SiteHeader() {
  const t = useTranslations("Site");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-indigo-600">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#courses" className="hover:text-slate-900">{t("nav.courses")}</a>
          <a href="#why" className="hover:text-slate-900">{t("nav.why")}</a>
          <a href="#contacts" className="hover:text-slate-900">{t("nav.contacts")}</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div role="group" aria-label={t("language")} className="flex rounded-full border border-slate-200 p-0.5 text-xs">
            {routing.locales.map((lang) => (
              <Link
                key={lang}
                href="/"
                locale={lang}
                aria-current={lang === locale ? "true" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium uppercase transition-colors",
                  lang === locale ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {lang}
              </Link>
            ))}
          </div>
          <AskButton className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:inline-flex">
            {t("askQuestion")}
          </AskButton>
        </div>
      </div>
    </header>
  );
}
