import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { db } from "@/db";
import { getSettings } from "@/lib/settings";
import type { SettingsFormValues } from "@/lib/validations/settings";

export const metadata: Metadata = { title: "Настройки" };

async function SettingsData() {
  const s = await getSettings(db);
  const initial: SettingsFormValues = {
    assistantName: s.assistantName,
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

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Настройки"
        description="Приветствие и быстрые вопросы виджета, контакты, курсы, разрешённые сайты и лимиты. Изменения применяются сразу после сохранения."
      />
      <AdminGate>
        <SettingsData />
      </AdminGate>
    </>
  );
}
