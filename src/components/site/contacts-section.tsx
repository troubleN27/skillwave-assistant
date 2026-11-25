import { useTranslations } from "next-intl";
import { CONTACTS } from "@/lib/site/courses";
import { AskButton } from "./ask-button";

export function ContactsSection() {
  const t = useTranslations("Site");

  const rows = [
    { label: t("contacts.email"), value: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
    {
      label: t("contacts.phone"),
      value: CONTACTS.phone,
      href: CONTACTS.phoneHref,
      note: t("contacts.phoneNote"),
    },
    { label: t("contacts.telegram"), value: CONTACTS.telegram, href: CONTACTS.telegramHref },
  ];

  return (
      <section id="contacts" className="scroll-mt-20 bg-slate-900 py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{t("contacts.title")}</h2>
            <p className="mt-3 max-w-[48ch] text-slate-300">{t("contacts.text")}</p>
            <AskButton className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {t("askQuestion")}
            </AskButton>
          </div>
          <dl className="grid gap-5 self-center">
            {rows.map((row) => (
              <div key={row.label} className="border-b border-white/10 pb-4">
                <dt className="text-sm text-slate-400">{row.label}</dt>
                <dd className="mt-1 text-lg font-medium">
                  <a href={row.href} className="hover:text-cyan-300">
                    {row.value}
                  </a>
                  {row.note && <span className="ml-2 text-sm text-slate-400">{row.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
  );
}
