import { MessagesSquareIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime, shortPageUrl } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodFilter } from "@/components/admin/period-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { CONVERSATIONS_PAGE_SIZE, listConversations } from "@/lib/admin/conversations";
import type { AdminLang } from "@/lib/admin/locale";
import { getAdminLang } from "@/lib/admin/page-lang";
import { parsePeriod, periodStart } from "@/lib/admin/period";

type Props = PageProps<"/admin/[lang]/conversations">;
type Search = Awaited<Props["searchParams"]>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("conversations") };
}

async function ConversationsList({ lang, searchParams }: { lang: AdminLang; searchParams: Props["searchParams"] }) {
  const t = await getTranslations("Admin.conversations");
  const params: Search = await searchParams;
  const period = parsePeriod(params.period);
  // ?lang= here filters conversations by the visitor's language.
  const locale = first(params.lang);
  const filters = {
    from: periodStart(period),
    locale: locale === "ru" || locale === "en" ? locale : undefined,
    hasLead: first(params.lead) === "1",
    unanswered: first(params.unanswered) === "1",
    negative: first(params.negative) === "1",
    page: Math.max(1, Number(first(params.page)) || 1),
  } as const;
  const { rows, total } = await listConversations(db, filters);
  const pages = Math.max(1, Math.ceil(total / CONVERSATIONS_PAGE_SIZE));

  const keep = {
    lang: filters.locale,
    lead: filters.hasLead ? "1" : undefined,
    unanswered: filters.unanswered ? "1" : undefined,
    negative: filters.negative ? "1" : undefined,
  };
  const pageHref = (page: number) => {
    const query = new URLSearchParams(
      Object.entries({ ...keep, period: String(period), page: String(page) }).filter(
        (e): e is [string, string] => Boolean(e[1]),
      ),
    );
    return `/admin/conversations?${query}`;
  };

  return (
    <>
      <div className="flex flex-col gap-3 border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <PeriodFilter current={period} basePath="/admin/conversations" params={keep} />
        <form method="get" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <input type="hidden" name="period" value={period} />
          <label className="flex items-center gap-2">
            {t("filters.language")}
            <select name="lang" defaultValue={filters.locale ?? ""} className="rounded-sm border bg-background px-2 py-1">
              <option value="">{t("filters.all")}</option>
              <option value="ru">{t("filters.ru")}</option>
              <option value="en">{t("filters.en")}</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="lead" value="1" defaultChecked={filters.hasLead} className="accent-primary" />
            {t("filters.withLead")}
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              name="unanswered"
              value="1"
              defaultChecked={filters.unanswered}
              className="accent-primary"
            />
            {t("filters.unanswered")}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="negative" value="1" defaultChecked={filters.negative} className="accent-primary" />
            {t("filters.negative")}
          </label>
          <Button type="submit" size="sm" variant="outline">
            {t("filters.apply")}
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={MessagesSquareIcon} title={t("empty")} description={t("emptyText")} />
      ) : (
        <div className="overflow-hidden border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("columns.lastMessage")}</TableHead>
                <TableHead>{t("columns.language")}</TableHead>
                <TableHead className="text-right">{t("columns.messages")}</TableHead>
                <TableHead>{t("columns.flags")}</TableHead>
                <TableHead>{t("columns.page")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/conversations/${row.id}`} className="font-semibold underline-offset-4 hover:underline">
                      {formatDateTime(row.lastMessageAt, lang)}
                    </Link>
                  </TableCell>
                  <TableCell className="uppercase">{row.locale ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.messageCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.hasLead && <Badge>{t("flags.lead")}</Badge>}
                      {row.hasUnanswered && <Badge variant="secondary">{t("flags.unanswered")}</Badge>}
                      {row.hasNegativeFeedback && <Badge variant="destructive">👎</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground" title={row.pageUrl ?? undefined}>
                    {shortPageUrl(row.pageUrl)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label={t("pagination.label")} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.summary", { total, page: filters.page, pages })}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 && (
              <Link href={pageHref(filters.page - 1)} className="inline-flex h-9 items-center border-2 border-ink bg-ink px-4 font-bold text-sun transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                {t("pagination.prev")}
              </Link>
            )}
            {filters.page < pages && (
              <Link href={pageHref(filters.page + 1)} className="inline-flex h-9 items-center border-2 border-ink bg-ink px-4 font-bold text-sun transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                {t("pagination.next")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

export default async function ConversationsPage({ searchParams }: Props) {
  const lang = await getAdminLang();
  const t = await getTranslations("Admin.conversations");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <ConversationsList lang={lang} searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
