import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/session";

export function SectionSkeleton() {
  const t = useTranslations("Admin.common");
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label={t("loading")}>
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

async function Gate({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}

/**
 * Renders request-dependent admin content behind a Suspense boundary, so the
 * page header stays in the static shell and navigations between sections are
 * instant (Next.js Cache Components). The session is verified before children.
 */
export function AdminGate({
  children,
  fallback = <SectionSkeleton />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
