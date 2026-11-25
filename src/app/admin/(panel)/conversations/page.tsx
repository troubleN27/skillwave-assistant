import { MessagesSquareIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminGate } from "@/components/admin/admin-gate";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime, shortPageUrl } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodFilter } from "@/components/admin/period-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { CONVERSATIONS_PAGE_SIZE, listConversations } from "@/lib/admin/conversations";
import { parsePeriod, periodStart } from "@/lib/admin/period";

export const metadata: Metadata = { title: "Диалоги" };

type Search = Awaited<PageProps<"/admin/conversations">["searchParams"]>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function ConversationsList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/conversations">["searchParams"];
}) {
  const params: Search = await searchParams;
  const period = parsePeriod(params.period);
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
      <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 lg:flex-row lg:items-center lg:justify-between">
        <PeriodFilter current={period} basePath="/admin/conversations" params={keep} />
        <form method="get" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <input type="hidden" name="period" value={period} />
          <label className="flex items-center gap-2">
            Язык
            <select
              name="lang"
              defaultValue={filters.locale ?? ""}
              className="rounded-md border bg-background px-2 py-1"
            >
              <option value="">Все</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="lead" value="1" defaultChecked={filters.hasLead} className="accent-primary" />
            С заявкой
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="unanswered" value="1" defaultChecked={filters.unanswered} className="accent-primary" />
            Без ответа
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="negative" value="1" defaultChecked={filters.negative} className="accent-primary" />
            С 👎
          </label>
          <Button type="submit" size="sm" variant="outline">
            Применить
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={MessagesSquareIcon}
          title="Диалогов не найдено"
          description="Измените период или фильтры. Диалоги появляются, когда посетители пишут ассистенту."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Последнее сообщение</TableHead>
                <TableHead>Язык</TableHead>
                <TableHead className="text-right">Сообщений</TableHead>
                <TableHead>Отметки</TableHead>
                <TableHead>Страница</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4">
                    <Link
                      href={`/admin/conversations/${row.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {formatDateTime(row.lastMessageAt)}
                    </Link>
                  </TableCell>
                  <TableCell className="uppercase">{row.locale ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.messageCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.hasLead && <Badge>Заявка</Badge>}
                      {row.hasUnanswered && <Badge variant="secondary">Без ответа</Badge>}
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
        <nav aria-label="Страницы" className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Всего: {total}. Страница {filters.page} из {pages}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 && (
              <Link href={pageHref(filters.page - 1)} className="rounded-md border px-3 py-1 hover:bg-muted">
                Назад
              </Link>
            )}
            {filters.page < pages && (
              <Link href={pageHref(filters.page + 1)} className="rounded-md border px-3 py-1 hover:bg-muted">
                Вперёд
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

export default function ConversationsPage({ searchParams }: PageProps<"/admin/conversations">) {
  return (
    <>
      <PageHeader
        title="Диалоги"
        description="История общения посетителей с ассистентом. Нажмите на дату, чтобы открыть диалог целиком."
      />
      <AdminGate>
        <ConversationsList searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
