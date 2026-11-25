import { CircleHelpIcon } from "lucide-react";
import Link from "next/link";
import { AdminGate } from "@/components/admin/admin-gate";
import { DailyChart } from "@/components/admin/dashboard/daily-chart";
import {
  formatCount,
  formatPercent,
  pluralRu,
  StatCard,
} from "@/components/admin/dashboard/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodFilter } from "@/components/admin/period-filter";
import { db } from "@/db";
import { getDailySeries, getDashboardSummary, getTopUnanswered } from "@/lib/admin/analytics";
import { parsePeriod, periodStart } from "@/lib/admin/period";

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const period = parsePeriod((await searchParams).period);
  const from = periodStart(period);
  const [summary, series, top] = await Promise.all([
    getDashboardSummary(db, from),
    getDailySeries(db, period),
    getTopUnanswered(db, from),
  ]);

  return (
    <>
      <PeriodFilter current={period} basePath="/admin" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Диалоги" value={formatCount(summary.conversations)} />
        <StatCard label="Сообщения" value={formatCount(summary.messages)} />
        <StatCard label="Заявки" value={formatCount(summary.leads)} />
        <StatCard
          label="Конверсия в заявку"
          value={formatPercent(summary.conversion)}
          hint="доля диалогов с заявкой"
        />
        <StatCard
          label="Без ответа"
          value={formatPercent(summary.unansweredRate)}
          hint="ответы без данных в базе"
        />
        <StatCard
          label="Оценки 👍"
          value={formatPercent(summary.positiveRate)}
          hint={
            summary.ratedAnswers
              ? `из ${formatCount(summary.ratedAnswers)} ${pluralRu(summary.ratedAnswers, ["оценки", "оценок", "оценок"])}`
              : "оценок пока нет"
          }
        />
      </div>

      <section className="rounded-2xl border bg-background p-4 sm:p-5" aria-labelledby="daily-title">
        <h2 id="daily-title" className="mb-3 font-semibold">
          Диалоги и заявки по дням
        </h2>
        <DailyChart data={series} />
      </section>

      <section className="rounded-2xl border bg-background p-4 sm:p-5" aria-labelledby="top-title">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="top-title" className="font-semibold">
            Частые вопросы без ответа
          </h2>
          <Link href="/admin/unanswered" className="text-sm text-primary hover:underline">
            Все вопросы
          </Link>
        </div>
        {top.length === 0 ? (
          <EmptyState
            icon={CircleHelpIcon}
            title="Новых вопросов без ответа нет"
            description="Когда ассистенту не хватит информации или ответ получит 👎, вопрос появится здесь."
          />
        ) : (
          <ol className="divide-y">
            {top.map((group) => (
              <li key={group.key} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 truncate" title={group.question}>
                  {group.question}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {group.count} {pluralRu(group.count, ["раз", "раза", "раз"])}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

export default function DashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <PageHeader title="Главная" description="Ключевые показатели работы ассистента за выбранный период." />
      <AdminGate>
        <Dashboard searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
