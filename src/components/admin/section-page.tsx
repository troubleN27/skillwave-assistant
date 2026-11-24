import type { LucideIcon } from "lucide-react";
import { AdminGate } from "./admin-gate";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

/** Admin section with a header and an empty state until data appears. */
export function SectionPage({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <AdminGate>
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </AdminGate>
    </>
  );
}
