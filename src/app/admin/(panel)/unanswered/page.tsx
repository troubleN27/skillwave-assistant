import { CircleHelpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminGate } from "@/components/admin/admin-gate";
import { pluralRu } from "@/components/admin/dashboard/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { UnansweredActions } from "@/components/admin/unanswered/unanswered-actions";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { listUnansweredGroups, type UnansweredStatus } from "@/lib/admin/unanswered";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Вопросы без ответа" };
// FAQ indexing runs after the Server Action response.
export const maxDuration = 60;

const TABS: { status: UnansweredStatus; label: string; empty: string }[] = [
  { status: "new", label: "Новые", empty: "Новых вопросов без ответа нет" },
  { status: "resolved", label: "Обработанные", empty: "Обработанных вопросов пока нет" },
  { status: "ignored", label: "Игнорированные", empty: "Игнорированных вопросов нет" },
];

const REASON_LABELS = { no_context: "Нет в базе знаний", negative_feedback: "Оценка 👎" } as const;

async function UnansweredList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/unanswered">["searchParams"];
}) {
  const raw = (await searchParams).status;
  const tab = TABS.find((t) => t.status === raw) ?? TABS[0];
  const groups = await listUnansweredGroups(db, tab.status);

  return (
    <>
      <nav aria-label="Статус" className="inline-flex w-fit rounded-lg border bg-background p-0.5">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/admin/unanswered?status=${t.status}`}
            aria-current={t.status === tab.status ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              t.status === tab.status
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {groups.length === 0 ? (
        <EmptyState
          icon={CircleHelpIcon}
          title={tab.empty}
          description="Сюда попадают вопросы, на которые ассистент не нашёл ответа в базе знаний, и ответы с оценкой 👎. Похожие формулировки собираются в одну группу."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li key={group.key} className="flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="font-medium break-words">{group.question}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {group.count} {pluralRu(group.count, ["раз", "раза", "раз"])}
                  </span>
                  <span>последний — {formatDateTime(group.lastAt)}</span>
                  {group.reasons.map((reason) => (
                    <Badge key={reason} variant={reason === "negative_feedback" ? "destructive" : "secondary"}>
                      {REASON_LABELS[reason]}
                    </Badge>
                  ))}
                  {group.conversationIds[0] && (
                    <Link href={`/admin/conversations/${group.conversationIds[0]}`} className="text-primary hover:underline">
                      Открыть диалог
                    </Link>
                  )}
                </div>
              </div>
              <UnansweredActions ids={group.ids} question={group.question} status={tab.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function UnansweredPage({ searchParams }: PageProps<"/admin/unanswered">) {
  return (
    <>
      <PageHeader
        title="Вопросы без ответа"
        description="Добавьте ответ — он сохранится в базе знаний как FAQ, и ассистент начнёт отвечать на этот вопрос."
      />
      <AdminGate>
        <UnansweredList searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
