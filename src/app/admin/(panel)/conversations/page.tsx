import type { Metadata } from "next";
import { MessagesSquareIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Диалоги" };

export default function ConversationsPage() {
  return (
    <SectionPage
      title="Диалоги"
      description="История общения посетителей с ассистентом."
      icon={MessagesSquareIcon}
      emptyTitle="Диалогов пока нет"
      emptyDescription="Здесь будут все диалоги из чата на сайте: вопросы, ответы, источники и оценки."
    />
  );
}
