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
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteDocumentAction,
  reindexDocumentAction,
} from "@/app/admin/(panel)/knowledge/actions";
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
import { SOURCE_TYPE_LABELS, type KnowledgeDocument } from "./types";
import { UploadDialog } from "./upload-dialog";

const POLL_INTERVAL_MS = 2000;


function StatusBadge({ doc }: { doc: KnowledgeDocument }) {
  if (doc.status === "processing") {
    return (
      <Badge variant="secondary">
        <Loader2Icon className="animate-spin" /> Обрабатывается
      </Badge>
    );
  }
  if (doc.status === "error") {
    return (
      <Badge variant="destructive" title={doc.error ?? undefined}>
        Ошибка
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Готов</Badge>
  );
}

type Dialog =
  | { type: "form"; mode: DocumentFormMode }
  | { type: "upload" }
  | { type: "chunks"; document: KnowledgeDocument }
  | { type: "delete"; document: KnowledgeDocument }
  | null;

export function KnowledgeManager({ documents }: { documents: KnowledgeDocument[] }) {
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
      if (result.ok) toast.success(`«${doc.title}» отправлен на переиндексацию`);
      else toast.error(result.error);
      router.refresh();
    });
  }

  function remove(doc: KnowledgeDocument) {
    startTransition(async () => {
      const result = await deleteDocumentAction(doc.id);
      if (result.ok) toast.success(`«${doc.title}» удалён`);
      else toast.error(result.error);
      setDialog(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDialog({ type: "upload" })}>
          <FileUpIcon /> Загрузить файл
        </Button>
        <Button
          variant="outline"
          onClick={() => setDialog({ type: "form", mode: { kind: "create-text" } })}
        >
          <FileTextIcon /> Добавить текст
        </Button>
        <Button
          variant="outline"
          onClick={() => setDialog({ type: "form", mode: { kind: "create-faq" } })}
        >
          <MessageCircleQuestionIcon /> Добавить FAQ
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="Документов пока нет"
          description="Загрузите файлы или добавьте текст и FAQ — ассистент начнёт отвечать по ним после индексации."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Язык</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Фрагменты</TableHead>
                <TableHead>Обновлён</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Действия</span>
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
                  <TableCell>{SOURCE_TYPE_LABELS[doc.sourceType]}</TableCell>
                  <TableCell className="uppercase">{doc.language}</TableCell>
                  <TableCell>
                    <StatusBadge doc={doc} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{doc.chunkCount}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDateTime(doc.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Действия с документом «${doc.title}»`}
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
                          Фрагменты
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDialog({ type: "form", mode: { kind: "edit", document: doc } })
                          }
                        >
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={doc.status === "processing"}
                          onClick={() => reindex(doc)}
                        >
                          Переиндексировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDialog({ type: "delete", document: doc })}
                        >
                          Удалить
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
              <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
              <AlertDialogDescription>
                «{dialog.document.title}» и все его фрагменты будут удалены. Ассистент перестанет
                отвечать по этому документу. Действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Отмена</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => remove(dialog.document)}
              >
                {pending && <Loader2Icon className="animate-spin" />}
                Удалить
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
