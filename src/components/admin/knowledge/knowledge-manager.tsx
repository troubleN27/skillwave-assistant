"use client";

import {
  BookOpenIcon,
  FileTextIcon,
  FileUpIcon,
  Loader2Icon,
  MessageCircleQuestionIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteDocumentAction,
  reindexDocumentAction,
} from "@/app/admin/[lang]/(panel)/knowledge/actions";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/components/admin/format";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChunksSheet } from "./chunks-sheet";
import { DocumentFormDialog, type DocumentFormMode } from "./document-form-dialog";
import { parseAdminLang } from "@/lib/admin/locale";
import { sourceTypeLabel, type KnowledgeDocument } from "./types";
import { UploadDialog } from "./upload-dialog";

const POLL_INTERVAL_MS = 2000;


function StatusBadge({ doc }: { doc: KnowledgeDocument }) {
  const t = useTranslations("Admin.knowledge.status");
  if (doc.status === "processing") {
    return (
      <Badge variant="secondary">
        <Loader2Icon className="animate-spin" /> {t("processing")}
      </Badge>
    );
  }
  if (doc.status === "error") {
    return (
      <Badge variant="destructive" title={doc.error ?? undefined}>
        {t("error")}
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{t("ready")}</Badge>
  );
}

type Dialog =
  | { type: "form"; mode: DocumentFormMode }
  | { type: "upload" }
  | { type: "chunks"; document: KnowledgeDocument }
  | { type: "delete"; document: KnowledgeDocument }
  | null;

export function KnowledgeManager({ documents }: { documents: KnowledgeDocument[] }) {
  const t = useTranslations("Admin.knowledge");
  const lang = parseAdminLang(useLocale());
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pending, startTransition] = useTransition();
  const hasProcessing = documents.some((d) => d.status === "processing");

  // Refresh server data while documents are being indexed.
  useEffect(() => {
    if (!hasProcessing) return;
    const timer = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasProcessing, router]);

  const close = () => setDialog(null);
  const saved = () => {
    setDialog(null);
    router.refresh();
  };

  function reindex(doc: KnowledgeDocument) {
    startTransition(async () => {
      const result = await reindexDocumentAction(doc.id);
      if (result.ok) toast.success(t("toast.reindexQueued", { title: doc.title }));
      else toast.error(result.error);
      router.refresh();
    });
  }

  function remove(doc: KnowledgeDocument) {
    startTransition(async () => {
      const result = await deleteDocumentAction(doc.id);
      if (result.ok) toast.success(t("toast.deleted", { title: doc.title }));
      else toast.error(result.error);
      setDialog(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDialog({ type: "upload" })}>
          <FileUpIcon /> {t("uploadFile")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setDialog({ type: "form", mode: { kind: "create-text" } })}
        >
          <FileTextIcon /> {t("addText")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setDialog({ type: "form", mode: { kind: "create-faq" } })}
        >
          <MessageCircleQuestionIcon /> {t("addFaq")}
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title={t("empty")}
          description={t("emptyText")}
        />
      ) : (
        <div className="overflow-hidden border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("columns.title")}</TableHead>
                <TableHead>{t("columns.type")}</TableHead>
                <TableHead>{t("columns.language")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.chunks")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">{t("columns.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="max-w-72 pl-4">
                    <button
                      type="button"
                      className="block truncate text-left font-medium hover:underline"
                      onClick={() => setDialog({ type: "chunks", document: doc })}
                      title={doc.title}
                    >
                      {doc.title}
                    </button>
                    {doc.status === "error" && doc.error && (
                      <p className="truncate text-xs text-destructive" title={doc.error}>
                        {doc.error}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{sourceTypeLabel(doc.sourceType, t("sourceText"))}</TableCell>
                  <TableCell className="uppercase">{doc.language}</TableCell>
                  <TableCell>
                    <StatusBadge doc={doc} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{doc.chunkCount}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDateTime(doc.updatedAt, lang)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("actionsFor", { title: doc.title })}
                            disabled={pending}
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-48">
                        <DropdownMenuItem
                          onClick={() => setDialog({ type: "chunks", document: doc })}
                        >
                          {t("menu.chunks")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDialog({ type: "form", mode: { kind: "edit", document: doc } })
                          }
                        >
                          {t("menu.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={doc.status === "processing"}
                          onClick={() => reindex(doc)}
                        >
                          {t("menu.reindex")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDialog({ type: "delete", document: doc })}
                        >
                          {t("menu.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialog?.type === "form" && (
        <DocumentFormDialog mode={dialog.mode} onClose={close} onSaved={saved} />
      )}
      {dialog?.type === "upload" && <UploadDialog onClose={close} onSaved={saved} />}
      {dialog?.type === "chunks" && <ChunksSheet document={dialog.document} onClose={close} />}
      {dialog?.type === "delete" && (
        <AlertDialog open onOpenChange={(open) => !open && !pending && close()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteDialog.text", { title: dialog.document.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>{t("deleteDialog.cancel")}</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => remove(dialog.document)}
              >
                {pending && <Loader2Icon className="animate-spin" />}
                {t("deleteDialog.confirm")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
