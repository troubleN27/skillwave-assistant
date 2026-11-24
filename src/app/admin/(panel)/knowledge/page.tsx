import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { KnowledgeManager } from "@/components/admin/knowledge/knowledge-manager";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/db";
import { listDocuments } from "@/lib/rag/documents";

export const metadata: Metadata = { title: "База знаний" };

// Server Actions on this page index documents after the response.
export const maxDuration = 60;

async function KnowledgeData() {
  const documents = await listDocuments(db);
  return <KnowledgeManager documents={documents} />;
}

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="База знаний"
        description="Документы, на основе которых отвечает ассистент. Нажмите на название, чтобы посмотреть фрагменты."
      />
      <AdminGate>
        <KnowledgeData />
      </AdminGate>
    </>
  );
}
