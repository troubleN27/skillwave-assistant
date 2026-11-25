import { setRequestLocale } from "next-intl/server";
import { ChatOpenProvider } from "@/components/chat/chat-context";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ContactsSection } from "@/components/site/contacts-section";
import { CoursesSection } from "@/components/site/courses-section";
import { Hero } from "@/components/site/hero";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhySection } from "@/components/site/why-section";
import { getWidgetConfig } from "@/lib/chat/widget-config";
import type { Language } from "@/lib/language";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await getWidgetConfig(locale as Language);

  return (
    <ChatOpenProvider>
      <SiteHeader />
      <main>
        <Hero />
        <CoursesSection />
        <WhySection />
        <ContactsSection />
      </main>
      <SiteFooter />
      <ChatWidget config={config} />
    </ChatOpenProvider>
  );
}
