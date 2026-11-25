import { useLocale, useTranslations } from "next-intl";
import { COURSES, formatRub, fullPaymentPrice } from "@/lib/site/courses";
import { Section, SectionTitle } from "./section";

type Option = { title: string; text: string };

export function PaymentSection() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const options = t.raw("payment.options") as Option[];

  return (
    <Section id="payment" tone="ink" seed={77} labelledBy="payment-title">
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
        <SectionTitle id="payment-title">{t("payment.title")}</SectionTitle>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-sun/80">{t("payment.subtitle")}</p>
      </div>

      <table className="mt-12 w-full border-collapse text-left">
        <thead className="hidden sm:table-header-group">
          <tr className="border-b-2 border-sun text-sm text-sun/70">
            <th scope="col" className="py-3 pr-4 font-semibold">
              {t("payment.course")}
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-semibold">
              {t("payment.full")}
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-semibold">
              {t("payment.now")}
            </th>
            <th scope="col" className="py-3 text-right font-semibold">
              {t("payment.monthly")}
            </th>
          </tr>
        </thead>
        <tbody>
          {COURSES.map((course) => (
            <tr
              key={course.id}
              className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-sun/25 py-4 sm:table-row sm:py-0"
            >
              <th scope="row" className="col-span-2 font-display text-xl font-black uppercase sm:py-4 sm:pr-4">
                {t(`courses.items.${course.id}.name`)}
              </th>
              <td className="text-sun/70 sm:py-4 sm:pr-4 sm:text-right sm:text-sun">
                <span className="text-sm sm:hidden">{t("payment.full")}: </span>
                {formatRub(course.price, locale)}
              </td>
              <td className="text-sun/70 sm:py-4 sm:pr-4 sm:text-right sm:text-sun">
                <span className="text-sm sm:hidden">{t("payment.now")}: </span>
                {formatRub(fullPaymentPrice(course.price), locale)}
              </td>
              <td className="col-span-2 font-display text-xl font-black sm:py-4 sm:text-right">
                <span className="font-sans text-sm font-normal text-sun/70 sm:hidden">{t("payment.monthly")}: </span>
                {t("payment.perMonth", { price: formatRub(course.monthly, locale) })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {options.map((option) => (
          <li key={option.title} className="border-t-2 border-sun pt-4">
            <h3 className="font-display text-xl font-black uppercase">{option.title}</h3>
            <p className="mt-2 leading-relaxed text-sun/80">{option.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
