import { CircleHelpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { DailyChart } from "@/components/admin/dashboard/daily-chart";
import { formatCount, formatPercent, StatCard } from "@/components/admin/dashboard/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodFilter } from "@/components/admin/period-filter";
import { db } from "@/db";
import { getDailySeries, getDashboardSummary, getTopUnanswered } from "@/lib/admin/analytics";
import type { AdminLang } from "@/lib/admin/locale";
import { getAdminLang } from "@/lib/admin/page-lang";
import { parsePeriod, periodStart } from "@/lib/admin/period";

type Props = PageProps<"/admin/[lang]">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("dashboard") };
}

async function Dashboard({ lang, searchParams }: { lang: AdminLang; searchParams: Props["searchParams"] }) {
  const t = await getTranslations("Admin.dashboard");
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
        <StatCard label={t("stats.conversations")} value={formatCount(summary.conversations, lang)} />
        <StatCard label={t("stats.messages")} value={formatCount(summary.messages, lang)} />
        <StatCard label={t("stats.leads")} value={formatCount(summary.leads, lang)} />
        <StatCard
          label={t("stats.conversion")}
          value={formatPercent(summary.conversion, lang)}
          hint={t("stats.conversionHint")}
        />
        <StatCard
          label={t("stats.unanswered")}
          value={formatPercent(summary.unansweredRate, lang)}
          hint={t("stats.unansweredHint")}
        />
        <StatCard
          label={t("stats.positive")}
          value={formatPercent(summary.positiveRate, lang)}
          hint={
            summary.ratedAnswers
              ? t("stats.ratedOf", { count: summary.ratedAnswers })
              : t("stats.noRatings")
          }
        />
      </div>

      <section className="border-2 border-ink bg-ink p-4 text-[#f4ecd0] shadow-[4px_4px_0_rgba(18,17,16,0.35)] sm:p-5" aria-labelledby="daily-title">
        <h2 id="daily-title" className="mb-3 font-display text-lg font-black text-sun uppercase">
          {t("dailyTitle")}
        </h2>
        <DailyChart data={series} />
      </section>

      <section className="border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4 sm:p-5" aria-labelledby="top-title">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="top-title" className="font-display text-lg font-black uppercase">
            {t("topTitle")}
          </h2>
          <Link href="/admin/unanswered" className="text-sm font-semibold underline-offset-4 hover:underline">
            {t("allQuestions")}
          </Link>
        </div>
        {top.length === 0 ? (
          <EmptyState icon={CircleHelpIcon} title={t("topEmpty")} description={t("topEmptyText")} />
        ) : (
          <ol className="divide-y">
            {top.map((group) => (
              <li key={group.key} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 truncate" title={group.question}>
                  {group.question}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {t("times", { count: group.count })}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

export default async function DashboardPage({ searchParams }: Props) {
  const lang = await getAdminLang();
  const t = await getTranslations("Admin.dashboard");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <Dashboard lang={lang} searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
