import type { Metadata } from "next";
import { SettingsIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Настройки" };

export default function SettingsPage() {
  return (
    <SectionPage
      title="Настройки"
      description="Имя и приветствие ассистента, быстрые вопросы, курсы и лимиты."
      icon={SettingsIcon}
      emptyTitle="Настройки скоро будут доступны"
      emptyDescription="Здесь можно будет изменить приветствие, быстрые вопросы, список курсов и лимиты сообщений."
    />
  );
}
