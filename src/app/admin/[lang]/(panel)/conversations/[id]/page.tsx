import { ArrowLeftIcon, FileTextIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { AdminGate } from "@/components/admin/admin-gate";
import { formatDateTime, safeHttpUrl, shortPageUrl } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { getConversationDetail } from "@/lib/admin/conversations";
import type { AdminLang } from "@/lib/admin/locale";
import { getAdminLang } from "@/lib/admin/page-lang";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Props = PageProps<"/admin/[lang]/conversations/[id]">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.conversation" });
  return { title: t("title") };
}

async function ConversationDetail({ lang, params }: { lang: AdminLang; params: Props["params"] }) {
  const t = await getTranslations("Admin.conversation");
  const tStatus = await getTranslations("Admin.leadStatus");
  const tChannel = await getTranslations("Admin.channel");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [detail, settings] = await Promise.all([getConversationDetail(db, id), getSettings(db)]);
  if (!detail) notFound();
  const { conversation, messages, leads } = detail;
  const courseName = (courseId: string | null) => {
    const course = settings.courses?.find((c) => c.id === courseId);
    return (lang === "en" ? course?.name_en : course?.name_ru) ?? courseId ?? "—";
  };
  const pageUrl = safeHttpUrl(conversation.pageUrl);

  return (
    <>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4 text-sm">
        <span>
          <span className="text-muted-foreground">{t("started")} </span>
          {formatDateTime(conversation.createdAt, lang)}
        </span>
        <span>
          <span className="text-muted-foreground">{t("language")} </span>
          {conversation.locale?.toUpperCase() ?? "—"}
        </span>
        <span>
          <span className="text-muted-foreground">{t("messageCount")} </span>
          {conversation.messageCount}
        </span>
        <span className="min-w-0 truncate">
          <span className="text-muted-foreground">{t("page")} </span>
          {pageUrl ? (
            <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline-offset-4 hover:underline">
              {shortPageUrl(conversation.pageUrl)}
            </a>
          ) : (
            (conversation.pageUrl ?? "—")
          )}
        </span>
      </div>

      {leads.map((lead) => (
        <section key={lead.id} aria-label={t("lead.title")} className="border-2 border-ink bg-sun p-4 text-sm">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-display font-black uppercase">{t("lead.title")}</h2>
            <Badge variant="secondary">{tStatus(lead.status)}</Badge>
            <span className="text-muted-foreground">{formatDateTime(lead.createdAt, lang)}</span>
          </div>
          <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <div>
              <dt className="inline text-muted-foreground">{t("lead.name")} </dt>
              <dd className="inline">{lead.name}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">{t("lead.contact")} </dt>
              <dd className="inline">{lead.contact}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">{t("lead.course")} </dt>
              <dd className="inline">{courseName(lead.courseId)}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">{t("lead.channel")} </dt>
              <dd className="inline">{lead.preferredChannel ? tChannel(lead.preferredChannel) : "—"}</dd>
            </div>
            {lead.comment && (
              <div className="sm:col-span-2">
                <dt className="inline text-muted-foreground">{t("lead.comment")} </dt>
                <dd className="inline">{lead.comment}</dd>
              </div>
            )}
          </dl>
          <Link href="/admin/leads" className="mt-2 inline-block font-semibold underline-offset-4 hover:underline">
            {t("lead.open")}
          </Link>
        </section>
      ))}

      <ol className="flex flex-col gap-3" aria-label={t("messages")}>
        {messages.map((message) => {
          const isUser = message.role === "user";
          const sources = [...new Map((message.sources ?? []).map((s) => [s.documentId, s])).values()];
          return (
            <li key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div className="max-w-[min(42rem,90%)]">
                <div
                  className={cn(
                    "rounded-md px-4 py-2.5 text-sm leading-relaxed break-words",
                    isUser ? "bg-primary text-primary-foreground" : "border bg-background",
                    message.answered === false && "border-amber-300 bg-amber-50",
                  )}
                >
                  {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <ChatMarkdown text={message.content} />}
                </div>
                <div
                  className={cn(
                    "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground",
                    isUser && "justify-end",
                  )}
                >
                  <span>{formatDateTime(message.createdAt, lang)}</span>
                  {message.answered === false && <span className="text-amber-700">{t("noData")}</span>}
                  {message.latencyMs != null && !isUser && (
                    <span>{t("latency", { seconds: (message.latencyMs / 1000).toFixed(1) })}</span>
                  )}
                  {message.feedback === "up" && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <ThumbsUpIcon className="size-3" aria-hidden />
                      {t("helpful")}
                    </span>
                  )}
                  {message.feedback === "down" && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <ThumbsDownIcon className="size-3" aria-hidden />
                      {t("notHelpful")}
                    </span>
                  )}
                </div>
                {sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                    {sources.map((s) => (
                      <span
                        key={s.documentId}
                        className="inline-flex items-center gap-1 rounded-sm border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
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

export default async function ConversationPage({ params }: Props) {
  const lang = await getAdminLang();
  const t = await getTranslations("Admin.conversation");
  return (
    <>
      <Link
        href="/admin/conversations"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        {t("back")}
      </Link>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <ConversationDetail lang={lang} params={params} />
      </AdminGate>
    </>
  );
}
