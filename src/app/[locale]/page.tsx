import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatOpenProvider } from "@/components/chat/chat-context";
import { ChatWidget } from "@/components/chat/chat-widget";
import { CareerSection } from "@/components/site/career-section";
import { ContactsSection } from "@/components/site/contacts-section";
import { CoursesSection } from "@/components/site/courses-section";
import { Hero } from "@/components/site/hero";
import { LeadDialogProvider } from "@/components/site/lead-dialog";
import { LearningSection } from "@/components/site/learning-section";
import { PaymentSection } from "@/components/site/payment-section";
import { ReviewsSection } from "@/components/site/reviews-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Stats } from "@/components/site/stats";
import { TeachersSection } from "@/components/site/teachers-section";
import { Ticker } from "@/components/site/ticker";
import { getWidgetConfig } from "@/lib/chat/widget-config";
import type { Language } from "@/lib/language";
import { COURSES } from "@/lib/site/courses";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [config, t] = await Promise.all([
    getWidgetConfig(locale as Language),
    getTranslations({ locale, namespace: "Site.courses.items" }),
  ]);
  const courses = COURSES.map((course) => ({ id: course.id, name: t(`${course.id}.name`) }));

  return (
    <ChatOpenProvider>
      <LeadDialogProvider courses={courses}>
        <SiteHeader />
        {/* Clip the slanted ticker and splats that reach past the page edge. */}
        <main className="overflow-x-clip">
          <Hero />
          <Ticker />
          <Stats />
          <CoursesSection />
          <LearningSection />
          <TeachersSection />
          <CareerSection />
          <ReviewsSection />
          <PaymentSection />
          <ContactsSection />
        </main>
        <SiteFooter />
      </LeadDialogProvider>
      <ChatWidget config={config} />
    </ChatOpenProvider>
  );
}
