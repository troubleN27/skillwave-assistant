import type { Metadata } from "next";
import { CircleHelpIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Вопросы без ответа" };

export default function UnansweredPage() {
  return (
    <SectionPage
      title="Вопросы без ответа"
      description="Вопросы, на которые ассистент не нашёл ответа или получил 👎."
      icon={CircleHelpIcon}
      emptyTitle="Все вопросы обработаны"
      emptyDescription="Когда ассистенту не хватит информации, вопрос появится здесь — его можно будет сразу добавить в базу знаний."
    />
  );
}
