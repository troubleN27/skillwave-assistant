import type { Metadata } from "next";
import { BookOpenIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "База знаний" };

export default function KnowledgePage() {
  return (
    <SectionPage
      title="База знаний"
      description="Документы, на основе которых отвечает ассистент."
      icon={BookOpenIcon}
      emptyTitle="Документов пока нет"
      emptyDescription="Загрузите файлы или добавьте текст и FAQ — ассистент начнёт отвечать по ним после индексации."
    />
  );
}
