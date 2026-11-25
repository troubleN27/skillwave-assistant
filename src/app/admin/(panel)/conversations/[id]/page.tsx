import { ArrowLeftIcon, FileTextIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { AdminGate } from "@/components/admin/admin-gate";
import {
  CHANNEL_LABELS,
  formatDateTime,
  LEAD_STATUS_LABELS,
  shortPageUrl,
} from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { getConversationDetail } from "@/lib/admin/conversations";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Диалог" };

async function ConversationDetail({
  params,
}: {
  params: PageProps<"/admin/conversations/[id]">["params"];
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [detail, settings] = await Promise.all([getConversationDetail(db, id), getSettings(db)]);
  if (!detail) notFound();
  const { conversation, messages, leads } = detail;
  const courseName = (courseId: string | null) =>
    settings.courses?.find((c) => c.id === courseId)?.name_ru ?? courseId ?? "—";

  return (
    <>
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border bg-background p-4 text-sm">
        <span>
          <span className="text-muted-foreground">Начат: </span>
          {formatDateTime(conversation.createdAt)}
        </span>
        <span>
          <span className="text-muted-foreground">Язык: </span>
          {conversation.locale?.toUpperCase() ?? "—"}
        </span>
        <span>
          <span className="text-muted-foreground">Сообщений: </span>
          {conversation.messageCount}
        </span>
        <span className="min-w-0 truncate">
          <span className="text-muted-foreground">Страница: </span>
          {conversation.pageUrl ? (
            <a href={conversation.pageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {shortPageUrl(conversation.pageUrl)}
            </a>
          ) : (
            "—"
          )}
        </span>
      </div>

      {leads.map((lead) => (
        <section
          key={lead.id}
          aria-label="Заявка"
          className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm"
        >
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-semibold">Заявка</h2>
            <Badge variant="secondary">{LEAD_STATUS_LABELS[lead.status]}</Badge>
            <span className="text-muted-foreground">{formatDateTime(lead.createdAt)}</span>
          </div>
          <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">Имя: </dt><dd className="inline">{lead.name}</dd></div>
            <div><dt className="inline text-muted-foreground">Контакт: </dt><dd className="inline">{lead.contact}</dd></div>
            <div><dt className="inline text-muted-foreground">Курс: </dt><dd className="inline">{courseName(lead.courseId)}</dd></div>
            <div>
              <dt className="inline text-muted-foreground">Связаться: </dt>
              <dd className="inline">{lead.preferredChannel ? CHANNEL_LABELS[lead.preferredChannel] : "—"}</dd>
            </div>
            {lead.comment && (
              <div className="sm:col-span-2"><dt className="inline text-muted-foreground">Комментарий: </dt><dd className="inline">{lead.comment}</dd></div>
            )}
          </dl>
          <Link href="/admin/leads" className="mt-2 inline-block text-primary hover:underline">
            Открыть в заявках
          </Link>
        </section>
      ))}

      <ol className="flex flex-col gap-3" aria-label="Сообщения">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const sources = [...new Map((message.sources ?? []).map((s) => [s.documentId, s])).values()];
          return (
            <li key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div className="max-w-[min(42rem,90%)]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
                    isUser ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-background",
                    message.answered === false && "border-amber-300 bg-amber-50",
                  )}
                >
                  {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <ChatMarkdown text={message.content} />}
                </div>
                <div className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground", isUser && "justify-end")}>
                  <span>{formatDateTime(message.createdAt)}</span>
                  {message.answered === false && <span className="text-amber-700">Нет данных в базе знаний</span>}
                  {message.latencyMs != null && !isUser && <span>первые слова через {(message.latencyMs / 1000).toFixed(1)} с</span>}
                  {message.feedback === "up" && (
                    <span className="inline-flex items-center gap-1 text-emerald-700"><ThumbsUpIcon className="size-3" aria-hidden />Ответ помог</span>
                  )}
                  {message.feedback === "down" && (
                    <span className="inline-flex items-center gap-1 text-destructive"><ThumbsDownIcon className="size-3" aria-hidden />Ответ не помог</span>
                  )}
                </div>
                {sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                    {sources.map((s) => (
                      <span key={s.documentId} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        <FileTextIcon className="size-3" aria-hidden />
                        {s.title} · {Math.round(s.similarity * 100)}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default function ConversationPage({ params }: PageProps<"/admin/conversations/[id]">) {
  return (
    <>
      <Link href="/admin/conversations" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden />
        Все диалоги
      </Link>
      <PageHeader title="Диалог" description="Вопросы посетителя, ответы ассистента, источники и оценки." />
      <AdminGate>
        <ConversationDetail params={params} />
      </AdminGate>
    </>
  );
}
