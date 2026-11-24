import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { SearchTestForm } from "@/components/admin/search-test/search-test-form";

export const metadata: Metadata = { title: "Проверка поиска" };

export default function SearchTestPage() {
  return (
    <>
      <PageHeader
        title="Проверка поиска"
        description="Какие фрагменты базы знаний ассистент находит по вопросу: близость, позиции в векторном и полнотекстовом поиске и итоговое место после объединения (RRF)."
      />
      <AdminGate>
        <SearchTestForm />
      </AdminGate>
    </>
  );
}
