import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { SearchTestForm } from "@/components/admin/search-test/search-test-form";
import { getAdminLang } from "@/lib/admin/page-lang";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("searchTest") };
}

export default async function SearchTestPage() {
  await getAdminLang();
  const t = await getTranslations("Admin.searchTest");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <SearchTestForm />
      </AdminGate>
    </>
  );
}
