"use client";

import { upload } from "@vercel/blob/client";
import { FileUpIcon, Loader2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createFileDocumentAction } from "@/app/admin/(panel)/knowledge/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FILE_CONTENT_TYPES,
  MAX_FILE_SIZE,
  sourceTypeFromFileName,
} from "@/lib/rag/file-types";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";

const ACCEPT = ".pdf,.docx,.txt,.md";

function titleFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
    : `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function UploadDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<"ru" | "en">("ru");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = progress !== null;

  function pick(selected: File | undefined) {
    setError(null);
    if (!selected) return;
    if (!sourceTypeFromFileName(selected.name)) {
      setError("Поддерживаются только файлы PDF, DOCX, TXT и MD");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError("Файл больше 10 МБ");
      return;
    }
    setFile(selected);
    setTitle(titleFromFileName(selected.name));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Выберите файл");
      return;
    }
    const sourceType = sourceTypeFromFileName(file.name);
    if (!sourceType) return;

    setError(null);
    setProgress(0);
    try {
      const blob = await upload(`knowledge/${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/admin/blob-upload",
        contentType: FILE_CONTENT_TYPES[sourceType][0],
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const result = await createFileDocumentAction({
        title,
        language,
        sourceType,
        blobUrl: blob.url,
      });
      if (!result.ok) {
        setError(result.error);
        setProgress(null);
        return;
      }
      toast.success("Файл загружен. Документ индексируется");
      onSaved();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error && uploadError.message
          ? `Не удалось загрузить файл: ${uploadError.message}`
          : "Не удалось загрузить файл",
      );
      setProgress(null);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Загрузить файл</DialogTitle>
            <DialogDescription>PDF, DOCX, TXT или MD, до 10 МБ.</DialogDescription>
          </DialogHeader>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files[0]);
            }}
            disabled={pending}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "hover:bg-muted",
            )}
          >
            <FileUpIcon className="size-8 text-primary" />
            {file ? (
              <span className="text-sm">
                <span className="font-medium break-all">{file.name}</span>
                <span className="text-muted-foreground"> · {formatSize(file.size)}</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Перетащите файл сюда или нажмите, чтобы выбрать
              </span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => pick(e.target.files?.[0])}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="upload-title">Название</Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Язык</Label>
            <LanguageToggle value={language} onChange={setLanguage} disabled={pending} />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending || !file}>
              {pending && <Loader2Icon className="animate-spin" />}
              {pending ? `Загрузка ${progress}%` : "Загрузить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
