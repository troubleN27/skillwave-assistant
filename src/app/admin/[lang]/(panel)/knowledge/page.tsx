import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { KnowledgeManager } from "@/components/admin/knowledge/knowledge-manager";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/db";
import { getAdminLang } from "@/lib/admin/page-lang";
import { listDocuments } from "@/lib/rag/documents";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("knowledge") };
}

// Server Actions on this page index documents after the response.
export const maxDuration = 60;

async function KnowledgeData() {
  const documents = await listDocuments(db);
  return <KnowledgeManager documents={documents} />;
}

export default async function KnowledgePage() {
  await getAdminLang();
  const t = await getTranslations("Admin.knowledge");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <KnowledgeData />
      </AdminGate>
    </>
  );
}
