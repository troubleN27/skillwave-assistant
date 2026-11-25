import { useTranslations } from "next-intl";
import { CONTACTS } from "@/lib/site/courses";
import { AskButton } from "./ask-button";
import { button } from "./buttons";
import { HalftonePhoto } from "./halftone-photo";
import { InkSplat } from "./ink";
import { LeadButton } from "./lead-dialog";
import { Section, SectionTitle } from "./section";

export function ContactsSection() {
  const t = useTranslations("Site");

  const rows = [
    { label: t("contacts.phone"), value: CONTACTS.phone, href: CONTACTS.phoneHref, note: t("contacts.phoneNote") },
    { label: t("contacts.email"), value: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
    { label: t("contacts.telegram"), value: CONTACTS.telegram, href: CONTACTS.telegramHref },
  ];

  return (
    <Section id="contacts" labelledBy="contacts-title">
      <div className="grid gap-12 md:grid-cols-[1.05fr_1fr] md:items-center">
        <div>
          <SectionTitle id="contacts-title">{t("contacts.title")}</SectionTitle>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">{t("contacts.text")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadButton data-splash className={button.ink}>{t("leaveRequest")}</LeadButton>
            <AskButton data-splash className={button.inkOutline}>{t("askAssistant")}</AskButton>
          </div>
          <dl className="mt-10 grid gap-4">
            {rows.map((row) => (
              <div key={row.label} className="border-t-2 border-ink pt-3">
                <dt className="text-sm text-ink-soft">{row.label}</dt>
                <dd className="mt-0.5 text-xl font-bold">
                  <a
                    href={row.href}
                    className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {row.value}
                  </a>
                  {row.note && <span className="ml-2 text-sm font-normal text-ink-soft">{row.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-soft">{t("contacts.hours")}</p>
        </div>
        <div className="relative">
          <InkSplat seed={88} data-anim="splat" className="absolute -right-10 -bottom-12 size-56 text-ink" />
          <HalftonePhoto
            src="/images/final-cta.jpg"
            alt={t("contacts.photoAlt")}
            sizes="(min-width: 768px) 520px, 100vw"
            stock="paper"
            className="chamfer relative aspect-[4/3] [--chamfer:28px]"
          />
        </div>
      </div>
    </Section>
  );
}
