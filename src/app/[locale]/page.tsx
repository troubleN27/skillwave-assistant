import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatOpenProvider } from "@/components/chat/chat-context";
import { ChatWidget } from "@/components/chat/chat-widget";
import { CareerSection } from "@/components/site/career-section";
import { ContactsSection } from "@/components/site/contacts-section";
import { CoursesSection } from "@/components/site/courses-section";
import { Hero } from "@/components/site/hero";
import { InkEdge } from "@/components/site/ink";
import { LeadDialogProvider } from "@/components/site/lead-dialog";
import { LearningSection } from "@/components/site/learning-section";
import { MotionRoot } from "@/components/site/motion-root";
import { PaymentSection } from "@/components/site/payment-section";
import { ReviewsSection } from "@/components/site/reviews-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Starts } from "@/components/site/starts";
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
        <MotionRoot>
          <SiteHeader />
          {/* Clip the slanted ticker and splats that reach past the page edge. */}
          <main className="relative overflow-x-clip">
            {/* Paint dripping from under the header; it stays at the top of the page
                instead of following the sticky header over the content. */}
            <InkEdge className="absolute inset-x-0 -top-px z-20" />
            <Hero />
            <Ticker />
            <Starts />
            <CoursesSection />
            <LearningSection />
            <TeachersSection />
            <CareerSection />
            <ReviewsSection />
            <PaymentSection />
            <ContactsSection />
          </main>
          <SiteFooter />
        </MotionRoot>
      </LeadDialogProvider>
      <ChatWidget config={config} />
    </ChatOpenProvider>
  );
}
