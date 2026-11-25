"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { ErrorState, primaryButton, secondaryButton } from "@/components/site/error-state";
import { Link } from "@/i18n/navigation";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState title={t("title")} text={t("text")}>
      <button type="button" onClick={() => retry()} className={primaryButton}>
        {t("retry")}
      </button>
      <Link href="/" className={secondaryButton}>
        {t("home")}
      </Link>
    </ErrorState>
  );
}
