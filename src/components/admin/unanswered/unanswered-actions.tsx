"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  answerWithFaqAction,
  setUnansweredStatusAction,
} from "@/app/admin/(panel)/unanswered/actions";
import { DocumentFormDialog } from "@/components/admin/knowledge/document-form-dialog";
import { Button } from "@/components/ui/button";

export function UnansweredActions({
  ids,
  question,
  status,
}: {
  ids: string[];
  question: string;
  status: "new" | "resolved" | "ignored";
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function changeStatus(next: "new" | "ignored", message: string) {
    startTransition(async () => {
      const result = await setUnansweredStatusAction(ids, next);
      if (result.ok) toast.success(message);
      else toast.error(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "resolved" && (
        <Button size="sm" onClick={() => setFormOpen(true)} disabled={pending}>
          Добавить ответ
        </Button>
      )}
      {status === "new" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => changeStatus("ignored", "Вопрос перенесён в игнорированные")}
        >
          {pending && <Loader2Icon className="animate-spin" />}
          Игнорировать
        </Button>
      )}
      {status !== "new" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => changeStatus("new", "Вопрос возвращён в новые")}
        >
          {pending && <Loader2Icon className="animate-spin" />}
          Вернуть в новые
        </Button>
      )}

      {formOpen && (
        <DocumentFormDialog
          mode={{ kind: "create-faq", question }}
          dialogTitle="Добавить ответ в базу знаний"
          submitFaq={(payload) => answerWithFaqAction(ids, payload)}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
