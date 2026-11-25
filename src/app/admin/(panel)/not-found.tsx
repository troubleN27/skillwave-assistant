import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={SearchXIcon}
        title="Страница не найдена"
        description="Возможно, запись удалена или ссылка устарела. Например, диалог из старого уведомления мог быть удалён."
      />
      <Link href="/admin" className="text-sm text-primary hover:underline">
        На главную панели
      </Link>
    </div>
  );
}
