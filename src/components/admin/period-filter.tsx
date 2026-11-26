import Link from "next/link";
import { useTranslations } from "next-intl";
import { PERIODS, type Period } from "@/lib/admin/period";
import { cn } from "@/lib/utils";

/** 7 / 30 / 90 days; keeps other query params of the page. */
export function PeriodFilter({
  current,
  basePath,
  params = {},
}: {
  current: Period;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const t = useTranslations("Admin.period");
  return (
    <nav aria-label={t("label")} className="inline-flex w-fit border-2 border-ink bg-white p-0.5">
      {PERIODS.map((period) => {
        const query = new URLSearchParams(
          Object.entries({ ...params, period: String(period), page: undefined }).filter(
            (entry): entry is [string, string] => Boolean(entry[1]),
          ),
        );
        return (
          <Link
            key={period}
            href={`${basePath}?${query}`}
            aria-current={period === current ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1 text-sm transition-colors",
              period === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("days", { count: period })}
          </Link>
        );
      })}
    </nav>
  );
}
