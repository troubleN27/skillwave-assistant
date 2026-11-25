import Link from "next/link";
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
  return (
    <nav aria-label="Период" className="inline-flex w-fit rounded-lg border bg-background p-0.5">
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
              "rounded-md px-3 py-1 text-sm transition-colors",
              period === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {period} дней
          </Link>
        );
      })}
    </nav>
  );
}
