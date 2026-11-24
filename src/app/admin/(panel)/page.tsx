import { LayoutDashboardIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export default function DashboardPage() {
  return (
    <SectionPage
      title="Главная"
      description="Ключевые показатели работы ассистента за выбранный период."
      icon={LayoutDashboardIcon}
      emptyTitle="Пока нет данных"
      emptyDescription="Здесь появятся диалоги, заявки и оценки ответов, как только посетители начнут общаться с ассистентом."
    />
  );
}
