"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  answerWithFaqAction,
  setUnansweredStatusAction,
} from "@/app/admin/[lang]/(panel)/unanswered/actions";
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
  const t = useTranslations("Admin.unanswered");
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
          {t("actions.answer")}
        </Button>
      )}
      {status === "new" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => changeStatus("ignored", t("toast.ignored"))}
        >
          {pending && <Loader2Icon className="animate-spin" />}
          {t("actions.ignore")}
        </Button>
      )}
      {status !== "new" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => changeStatus("new", t("toast.restored"))}
        >
          {pending && <Loader2Icon className="animate-spin" />}
          {t("actions.restore")}
        </Button>
      )}

      {formOpen && (
        <DocumentFormDialog
          mode={{ kind: "create-faq", question }}
          dialogTitle={t("dialogTitle")}
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
