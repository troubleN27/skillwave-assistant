import { UserRoundPlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminGate } from "@/components/admin/admin-gate";
import { EmptyState } from "@/components/admin/empty-state";
import { CHANNEL_LABELS, formatDateTime, LEAD_STATUS_LABELS } from "@/components/admin/format";
import { LeadNoteButton, LeadStatusSelect } from "@/components/admin/leads/lead-row-actions";
import { PageHeader } from "@/components/admin/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { listLeads, type LeadStatus } from "@/lib/admin/leads";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Заявки" };

const FILTERS: { value?: LeadStatus; label: string }[] = [
  { label: "Все" },
  { value: "new", label: LEAD_STATUS_LABELS.new },
  { value: "in_progress", label: LEAD_STATUS_LABELS.in_progress },
  { value: "closed", label: LEAD_STATUS_LABELS.closed },
];

async function LeadsTable({ searchParams }: { searchParams: PageProps<"/admin/leads">["searchParams"] }) {
  const raw = (await searchParams).status;
  const status = FILTERS.find((f) => f.value && f.value === raw)?.value;
  const [rows, settings] = await Promise.all([listLeads(db, status), getSettings(db)]);
  const courseName = (id: string | null) =>
    settings.courses?.find((c) => c.id === id)?.name_ru ?? id ?? "—";

  return (
    <>
      <nav aria-label="Статус" className="inline-flex w-fit rounded-lg border bg-background p-0.5">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/leads?status=${f.value}` : "/admin/leads"}
            aria-current={f.value === status ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              f.value === status
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          icon={UserRoundPlusIcon}
          title={status ? "Заявок с таким статусом нет" : "Заявок пока нет"}
          description="Заявки появляются, когда посетители оставляют контакты в чате. Менеджер также получает их в Telegram."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Дата</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Курс</TableHead>
                <TableHead>Связаться</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Заметка</TableHead>
                <TableHead>Диалог</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((lead) => (
                <TableRow key={lead.id} className="align-top">
                  <TableCell className="pl-4 tabular-nums">{formatDateTime(lead.createdAt)}</TableCell>
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
                  <TableCell>{lead.preferredChannel ? CHANNEL_LABELS[lead.preferredChannel] : "—"}</TableCell>
                  <TableCell>
                    <LeadStatusSelect id={lead.id} status={lead.status} name={lead.name} />
                  </TableCell>
                  <TableCell>
                    <LeadNoteButton id={lead.id} note={lead.managerNote} name={lead.name} />
                  </TableCell>
                  <TableCell>
                    {lead.conversationId ? (
                      <Link href={`/admin/conversations/${lead.conversationId}`} className="text-primary hover:underline">
                        Открыть
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

export default function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  return (
    <>
      <PageHeader title="Заявки" description="Контакты посетителей, оставленные в чате. Меняйте статус и оставляйте заметки по ходу работы." />
      <AdminGate>
        <LeadsTable searchParams={searchParams} />
      </AdminGate>
    </>
  );
}
