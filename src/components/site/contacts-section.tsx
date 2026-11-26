import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { COURSES, CONTACTS, formatRub, formatStartDate, fullPaymentPrice } from "@/lib/site/courses";
import { AskButton } from "./ask-button";
import { button } from "./buttons";
import { ChatReplies, type Reply } from "./chat-replies";
import { InkSplat } from "./ink";
import { LeadButton } from "./lead-dialog";
import { Section, SectionTitle } from "./section";

/* The sample conversation quotes the UX/UI course; prices and dates come from the site data. */
const sampleCourse = COURSES.find((course) => course.id === "ux-ui")!;

export function ContactsSection() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const bold = (chunks: ReactNode) => <strong className="font-extrabold">{chunks}</strong>;
  const replies: Reply[] = [
    { from: "user", content: t("contacts.chat.question1") },
    {
      from: "assistant",
      content: t.rich("contacts.chat.answer1", {
        course: t("courses.items.ux-ui.name"),
        months: sampleCourse.months,
        price: formatRub(sampleCourse.price, locale),
        full: formatRub(fullPaymentPrice(sampleCourse.price), locale),
        monthly: formatRub(sampleCourse.monthly, locale),
        start: formatStartDate(sampleCourse.start, locale),
        b: bold,
      }),
      sources: t.raw("contacts.chat.sources1") as string[],
    },
    { from: "user", content: t("contacts.chat.question2") },
    { from: "assistant", content: t("contacts.chat.answer2"), sources: t.raw("contacts.chat.sources2") as string[] },
  ];

  const rows = [
    { label: t("contacts.phone"), value: CONTACTS.phone, href: CONTACTS.phoneHref },
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
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-soft">{t("contacts.hours")}</p>
        </div>
        <div className="relative">
          <InkSplat seed={87} data-anim="splat" className="absolute -bottom-16 -left-14 size-56" />
          <div className="relative">
            <ChatReplies
              replies={replies}
              labels={{
                conversation: t("contacts.chat.label"),
                you: t("contacts.chat.you"),
                assistant: t("contacts.chat.assistant"),
                typing: t("contacts.chat.typing"),
              }}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
