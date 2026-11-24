import type { Metadata } from "next";
import { SearchCheckIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Проверка поиска" };

export default function SearchTestPage() {
  return (
    <SectionPage
      title="Проверка поиска"
      description="Какие фрагменты базы знаний ассистент находит по вопросу."
      icon={SearchCheckIcon}
      emptyTitle="Поиск пока недоступен"
      emptyDescription="Проверка поиска заработает, когда в базе знаний появятся проиндексированные документы."
    />
  );
}
