import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/admin/empty-state";
import { getAdminLang } from "@/lib/admin/page-lang";

export default async function AdminNotFound() {
  await getAdminLang();
  const t = await getTranslations("Admin.notFound");
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState icon={SearchXIcon} title={t("title")} description={t("text")} />
      <Link href="/admin" className="text-sm font-semibold underline-offset-4 hover:underline">
        {t("home")}
      </Link>
    </div>
  );
}
