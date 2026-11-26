import { UserRoundPlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/admin/admin-gate";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime, LEAD_STATUSES } from "@/components/admin/format";
import { LeadNoteButton, LeadStatusSelect } from "@/components/admin/leads/lead-row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { listLeads } from "@/lib/admin/leads";
import type { AdminLang } from "@/lib/admin/locale";
import { getAdminLang } from "@/lib/admin/page-lang";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Props = PageProps<"/admin/[lang]/leads">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.nav" });
  return { title: t("leads") };
}

async function LeadsTable({ lang, searchParams }: { lang: AdminLang; searchParams: Props["searchParams"] }) {
  const t = await getTranslations("Admin.leads");
  const tStatus = await getTranslations("Admin.leadStatus");
  const tChannel = await getTranslations("Admin.channel");
  const raw = (await searchParams).status;
  const status = LEAD_STATUSES.find((s) => s === raw);
  const [rows, settings] = await Promise.all([listLeads(db, status), getSettings(db)]);
  const courseName = (id: string | null) => {
    const course = settings.courses?.find((c) => c.id === id);
    return (lang === "en" ? course?.name_en : course?.name_ru) ?? id ?? "—";
  };
  const filters = [undefined, ...LEAD_STATUSES];

  return (
    <>
      <nav aria-label={t("statusLabel")} className="inline-flex w-fit border-2 border-ink bg-white p-0.5">
        {filters.map((value) => (
          <Link
            key={value ?? "all"}
            href={value ? `/admin/leads?status=${value}` : "/admin/leads"}
            aria-current={value === status ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1 text-sm transition-colors",
              value === status ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value ? tStatus(value) : t("all")}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          icon={UserRoundPlusIcon}
          title={status ? t("emptyFiltered") : t("empty")}
          description={t("emptyText")}
        />
      ) : (
        <div className="overflow-hidden border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("columns.date")}</TableHead>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.contact")}</TableHead>
                <TableHead>{t("columns.course")}</TableHead>
                <TableHead>{t("columns.channel")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.note")}</TableHead>
                <TableHead>{t("columns.conversation")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((lead) => (
                <TableRow key={lead.id} className="align-top">
                  <TableCell className="pl-4 tabular-nums">{formatDateTime(lead.createdAt, lang)}</TableCell>
                  <TableCell className="max-w-40 whitespace-normal">
                    <p className="font-medium">{lead.name}</p>
                    {lead.comment && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={lead.comment}>
                        {lead.comment}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>{courseName(lead.courseId)}</TableCell>
                  <TableCell>{lead.preferredChannel ? tChannel(lead.preferredChannel) : "—"}</TableCell>
                  <TableCell>
                    <LeadStatusSelect id={lead.id} status={lead.status} name={lead.name} />
                  </TableCell>
                  <TableCell>
                    <LeadNoteButton id={lead.id} note={lead.managerNote} name={lead.name} />
                  </TableCell>
                  <TableCell>
                    {lead.conversationId ? (
                      <Link
                        href={`/admin/conversations/${lead.conversationId}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {t("open")}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export default async function LeadsPage({ searchParams }: Props) {
  const lang = await getAdminLang();
  const t = await getTranslations("Admin.leads");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGate>
        <LeadsTable lang={lang} searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
