import { useTranslations } from "next-intl";
import { CONTACTS } from "@/lib/site/courses";
import { HomeLink } from "./home-link";
import { TornEdge } from "./ink";
import { Logo } from "./logo";
import { NAV_ITEMS } from "./nav-items";

const linkClass =
  "text-sun/85 transition-colors hover:text-sun hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun";

export function SiteFooter() {
  const t = useTranslations("Site");

  return (
    <footer className="mt-auto">
      <TornEdge seed={23} side="top" drips={false} className="-mb-px text-ink" />
      {/* Extra bottom padding keeps the text clear of the floating chat button. */}
      <div className="bg-ink pb-28 text-sun sm:pb-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
          <div>
            <HomeLink className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun">
              <Logo inverted />
            </HomeLink>
            <p className="mt-4 max-w-[34ch] text-sm text-sun/75">{t("footer.tagline")}</p>
          </div>
          <nav aria-label={t("footer.navTitle")}>
            <h2 className="font-display text-sm font-bold text-sun/60">{t("footer.navTitle")}</h2>
            <ul className="mt-3 grid gap-2 text-[15px]">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a href={`#${item}`} className={linkClass}>
                    {t(`nav.${item}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="font-display text-sm font-bold text-sun/60">{t("footer.contactsTitle")}</h2>
            <ul className="mt-3 grid gap-2 text-[15px]">
              <li>
                <a href={`mailto:${CONTACTS.email}`} className={linkClass}>
                  {CONTACTS.email}
                </a>
              </li>
              <li>
                <a href={CONTACTS.phoneHref} className={linkClass}>
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                <a href={CONTACTS.telegramHref} className={linkClass}>
                  {CONTACTS.telegram}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-sun/55 sm:px-6">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
