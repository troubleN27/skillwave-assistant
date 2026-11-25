"use client";

// Client component: loading UI renders apart from the page, and the client
// provider already has the texts in the right language.
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  const t = useTranslations("Admin.common");
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label={t("loading")}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}
