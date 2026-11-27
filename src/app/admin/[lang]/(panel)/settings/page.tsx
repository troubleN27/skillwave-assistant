import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { db } from "@/db";
import { getAdminLang } from "@/lib/admin/page-lang";
import { getSettings } from "@/lib/settings";
import type { SettingsFormValues } from "@/lib/validations/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("settings") };
}

async function SettingsData() {
  const s = await getSettings(db);
  const initial: SettingsFormValues = {
    assistantNameRu: s.assistantNameRu,
    assistantNameEn: s.assistantNameEn,
    welcomeRu: s.welcomeRu ?? "",
    welcomeEn: s.welcomeEn ?? "",
    quickQuestionsRu: (s.quickQuestionsRu ?? []).join("\n"),
    quickQuestionsEn: (s.quickQuestionsEn ?? []).join("\n"),
    contactsRu: s.contactsRu ?? "",
    contactsEn: s.contactsEn ?? "",
    courses: s.courses ?? [],
    allowedOrigins: (s.allowedOrigins ?? []).join("\n"),
    maxMessagesPerConversation: s.maxMessagesPerConversation,
    maxMessagesPerDay: s.maxMessagesPerDay,
    minSimilarity: s.minSimilarity,
    telegramNotifications: s.telegramNotifications,
  };
  return <SettingsForm initial={initial} />;
}

export default async function SettingsPage() {
  await getAdminLang();
  const t = await getTranslations("Admin.settings");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <SettingsData />
      </AdminGate>
    </>
  );
}
