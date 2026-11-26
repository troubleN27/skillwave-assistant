import { CircleHelpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { UnansweredActions } from "@/components/admin/unanswered/unanswered-actions";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import type { AdminLang } from "@/lib/admin/locale";
import { getAdminLang } from "@/lib/admin/page-lang";
import { listUnansweredGroups, type UnansweredStatus } from "@/lib/admin/unanswered";
import { cn } from "@/lib/utils";

type Props = PageProps<"/admin/[lang]/unanswered">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("unanswered") };
}
// FAQ indexing runs after the Server Action response.
export const maxDuration = 60;

const STATUSES: UnansweredStatus[] = ["new", "resolved", "ignored"];

async function UnansweredList({ lang, searchParams }: { lang: AdminLang; searchParams: Props["searchParams"] }) {
  const t = await getTranslations("Admin.unanswered");
  const raw = (await searchParams).status;
  const status = STATUSES.find((s) => s === raw) ?? STATUSES[0];
  const groups = await listUnansweredGroups(db, status);

  return (
    <>
      <nav aria-label={t("statusLabel")} className="inline-flex w-fit border-2 border-ink bg-white p-0.5">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/unanswered?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1 text-sm transition-colors",
              s === status ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`tabs.${s}`)}
          </Link>
        ))}
      </nav>

      {groups.length === 0 ? (
        <EmptyState icon={CircleHelpIcon} title={t(`empty.${status}`)} description={t("emptyText")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li
              key={group.key}
              className="flex flex-col gap-3 border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium break-words">{group.question}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="tabular-nums">{t("times", { count: group.count })}</span>
                  <span>{t("lastAt", { date: formatDateTime(group.lastAt, lang) })}</span>
                  {group.reasons.map((reason) => (
                    <Badge key={reason} variant={reason === "negative_feedback" ? "destructive" : "secondary"}>
                      {t(`reasons.${reason}`)}
                    </Badge>
                  ))}
                  {group.conversationIds[0] && (
                    <Link
                      href={`/admin/conversations/${group.conversationIds[0]}`}
                      className="font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {t("openConversation")}
                    </Link>
                  )}
                </div>
              </div>
              <UnansweredActions ids={group.ids} question={group.question} status={status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default async function UnansweredPage({ searchParams }: Props) {
  const lang = await getAdminLang();
  const t = await getTranslations("Admin.unanswered");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <UnansweredList lang={lang} searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
