import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
    </main>
  );
}
