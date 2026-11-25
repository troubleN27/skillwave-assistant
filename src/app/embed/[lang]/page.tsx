import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { EmbeddedChat } from "@/components/chat/embedded-chat";
import { getWidgetConfig } from "@/lib/chat/widget-config";
import type { Language } from "@/lib/language";

const LANGUAGES: Language[] = ["ru", "en"];

// Loaded only inside an iframe, never through client-side navigation, so
// instant-navigation validation doesn't apply. Both languages are still
// prerendered via generateStaticParams.
export const instant = false;

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

/**
 * Chat window for iframes created by public/widget.js (SPEC 6.6).
 * The public URL is /embed?lang=ru|en; src/proxy.ts rewrites it here.
 */
export default async function EmbedPage({ params }: PageProps<"/embed/[lang]">) {
  const { lang } = await params;
  if (!LANGUAGES.includes(lang as Language)) notFound();
  const locale = lang as Language;
  // Lets next-intl resolve the locale without reading request headers (static rendering).
  setRequestLocale(locale);

  const [messages, config] = await Promise.all([
    import(`../../../../messages/${locale}.json`).then((m) => m.default),
    getWidgetConfig(locale),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EmbeddedChat config={config} />
    </NextIntlClientProvider>
  );
}
