"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { getDocumentChunksAction } from "@/app/admin/(panel)/knowledge/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { KnowledgeDocument } from "./types";

type ChunkRow = Awaited<ReturnType<typeof getDocumentChunksAction>>[number];

export function ChunksSheet({
  document,
  onClose,
}: {
  document: KnowledgeDocument;
  onClose: () => void;
}) {
  const [chunks, setChunks] = useState<ChunkRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDocumentChunksAction(document.id)
      .then((rows) => !cancelled && setChunks(rows))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [document.id]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">{document.title}</SheetTitle>
          <SheetDescription>
            Фрагменты, по которым ассистент ищет ответы: {document.chunkCount}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {failed ? (
            <p className="text-sm text-destructive">Не удалось загрузить фрагменты</p>
          ) : chunks === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Загрузка…
            </div>
          ) : chunks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Фрагментов пока нет — документ ещё не проиндексирован.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {chunks.map((chunk) => (
                <li key={chunk.id} className="rounded-xl border bg-background p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    #{chunk.position + 1}
                    {chunk.heading && ` · ${chunk.heading}`}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{chunk.content}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
