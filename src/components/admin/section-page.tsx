import type { LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

/** Admin section with a header and an empty state until data appears. */
export async function SectionPage({
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
  await requireAdmin();

  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
    </>
  );
}
