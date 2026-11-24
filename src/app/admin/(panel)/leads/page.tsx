import type { Metadata } from "next";
import { UserRoundPlusIcon } from "lucide-react";
import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Заявки" };

export default function LeadsPage() {
  return (
    <SectionPage
      title="Заявки"
      description="Контакты посетителей, оставленные в чате."
      icon={UserRoundPlusIcon}
      emptyTitle="Заявок пока нет"
      emptyDescription="Новые заявки из чата появятся здесь и придут менеджеру в Telegram."
    />
  );
}
