import { useTranslations } from "next-intl";
import { ErrorState, primaryButton } from "@/components/site/error-state";
import { Link } from "@/i18n/navigation";

export default function SiteNotFound() {
  const t = useTranslations("Errors");
  return (
    <ErrorState title={t("notFoundTitle")} text={t("notFoundText")}>
      <Link href="/" className={primaryButton}>
        {t("home")}
      </Link>
    </ErrorState>
  );
}
