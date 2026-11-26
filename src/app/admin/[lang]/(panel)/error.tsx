"use client";

import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Admin section failed to load (e.g. database unavailable). */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("Admin.error");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] px-6 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" aria-hidden />
      </div>
      <div className="max-w-md">
        <p className="font-medium">{t("title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("text")}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>{t("retry")}</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
          {t("home")}
        </Button>
      </div>
    </div>
  );
}
