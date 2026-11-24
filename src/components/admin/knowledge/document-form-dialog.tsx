"use client";

import { Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createFaqDocumentAction,
  createTextDocumentAction,
  updateTextDocumentAction,
  type ActionResult,
} from "@/app/admin/(panel)/knowledge/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { parseFaqContent } from "@/lib/validations/knowledge";
import { LanguageToggle } from "./language-toggle";
import type { KnowledgeDocument } from "./types";

export type DocumentFormMode =
  | { kind: "create-text" }
  | { kind: "create-faq"; question?: string }
  | { kind: "edit"; document: KnowledgeDocument };

function initialState(mode: DocumentFormMode) {
  if (mode.kind === "edit") {
    const doc = mode.document;
    const faq = doc.sourceType === "faq" ? parseFaqContent(doc.content) : null;
    return {
      title: doc.title,
      content: doc.content,
      question: faq?.question ?? "",
      answer: faq?.answer ?? "",
      language: doc.language,
    };
  }
  return {
    title: "",
    content: "",
    question: mode.kind === "create-faq" ? (mode.question ?? "") : "",
    answer: "",
    language: "ru" as const,
  };
}

export function DocumentFormDialog({
  mode,
  onClose,
  onSaved,
}: {
  mode: DocumentFormMode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => initialState(mode));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sourceType = mode.kind === "edit" ? mode.document.sourceType : null;
  const isFaq = mode.kind === "create-faq" || sourceType === "faq";
  const isFile = sourceType === "pdf" || sourceType === "docx";

  const title =
    mode.kind === "create-text"
      ? "Добавить текст"
      : mode.kind === "create-faq"
        ? "Добавить FAQ"
        : "Редактировать документ";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      let result: ActionResult;
      const payload = isFaq
        ? { question: form.question, answer: form.answer, language: form.language }
        : isFile
          ? { title: form.title, language: form.language }
          : { title: form.title, content: form.content, language: form.language };

      try {
        if (mode.kind === "edit") {
          result = await updateTextDocumentAction(mode.document.id, payload);
        } else if (isFaq) {
          result = await createFaqDocumentAction(payload);
        } else {
          result = await createTextDocumentAction(payload);
        }
      } catch {
        result = { ok: false, error: "Не удалось сохранить. Проверьте подключение" };
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Сохранено. Документ индексируется");
      onSaved();
    });
  }

  const set = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isFaq
                ? "Пара «вопрос — ответ» всегда хранится как один фрагмент."
                : isFile
                  ? "Текст файла извлекается автоматически; можно изменить название и язык."
                  : "После сохранения документ будет проиндексирован, и ассистент начнёт по нему отвечать."}
            </DialogDescription>
          </DialogHeader>

          {isFaq ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="faq-question">Вопрос</Label>
                <Input id="faq-question" value={form.question} onChange={set("question")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="faq-answer">Ответ</Label>
                <Textarea
                  id="faq-answer"
                  rows={6}
                  value={form.answer}
                  onChange={set("answer")}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="doc-title">Название</Label>
                <Input id="doc-title" value={form.title} onChange={set("title")} />
              </div>
              {!isFile && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="doc-content">Текст</Label>
                  <Textarea
                    id="doc-content"
                    rows={12}
                    className="max-h-[50svh] font-mono text-xs"
                    value={form.content}
                    onChange={set("content")}
                    placeholder="Можно использовать Markdown: заголовки ## разбивают текст на разделы"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label>Язык</Label>
            <LanguageToggle
              value={form.language}
              disabled={pending}
              onChange={(language) => setForm((prev) => ({ ...prev, language }))}
            />
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
            <Button type="submit" disabled={pending}>
              {pending && <Loader2Icon className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
