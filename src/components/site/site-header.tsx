import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { TornEdge } from "./ink";
import { HomeLink } from "./home-link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NAV_ITEMS } from "./nav-items";

export function SiteHeader() {
  const t = useTranslations("Site");
  const locale = useLocale();

  return (
    <header className="pointer-events-none sticky top-0 z-40">
      <div className="pointer-events-auto bg-ink text-sun">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:h-[72px] sm:px-6">
          <HomeLink className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun">
            <Logo inverted />
          </HomeLink>
          <nav aria-label={t("navLabel")} className="mx-auto hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-[15px] font-semibold text-sun/85 underline-offset-[6px] transition-colors hover:text-sun hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun"
              >
                {t(`nav.${item}`)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div role="group" aria-label={t("language")} className="flex border-2 border-sun/80 text-xs">
              {routing.locales.map((lang) => (
                <Link
                  key={lang}
                  href="/"
                  locale={lang}
                  aria-current={lang === locale ? "true" : undefined}
                  className={cn(
                    "px-2 py-1 font-display font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun",
                    lang === locale ? "bg-sun text-ink" : "text-sun hover:bg-sun/15",
                  )}
                >
                  {lang}
                </Link>
              ))}
            </div>
            <a
              href="#courses"
              className="hidden h-11 items-center bg-sun px-5 text-sm font-bold text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun lg:inline-flex"
            >
              {t("chooseCourse")}
            </a>
            <MobileMenu />
          </div>
        </div>
      </div>
      {/* The ink runs off the bar onto the page below. */}
      <TornEdge seed={7} drips={false} className="-mt-px text-ink" />
    </header>
  );
}
