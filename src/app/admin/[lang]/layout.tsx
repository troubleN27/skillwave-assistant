import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ADMIN_LANGS, type AdminLang } from "@/lib/admin/locale";
import { manrope, tektur } from "@/lib/fonts";
import "../../globals.css";

export function generateStaticParams() {
  return ADMIN_LANGS.map((lang) => ({ lang }));
}

const isAdminLang = (value: string): value is AdminLang => (ADMIN_LANGS as readonly string[]).includes(value);

export async function generateMetadata({ params }: LayoutProps<"/admin/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: isAdminLang(lang) ? lang : "ru", namespace: "Admin.meta" });
  return {
    title: { default: t("title"), template: "%s — Skillwave Academy" },
    robots: { index: false, follow: false },
  };
}

/** Root layout of the admin panel; the proxy picks [lang] from a cookie. */
export default async function AdminRootLayout({ children, params }: LayoutProps<"/admin/[lang]">) {
  const { lang } = await params;
  if (!isAdminLang(lang)) notFound();
  setRequestLocale(lang);
  // Imported by the static [lang] param: next-intl's getMessages() would count as request data here.
  const messages = (await import(`../../../../messages/${lang}.json`)).default;

  return (
    <html lang={lang} className={`${manrope.variable} ${tektur.variable} h-full antialiased`}>
      <body className="admin-theme min-h-full bg-muted">
        {/* Client components in the admin only need the Admin texts. */}
        <NextIntlClientProvider messages={{ Admin: messages.Admin }}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
