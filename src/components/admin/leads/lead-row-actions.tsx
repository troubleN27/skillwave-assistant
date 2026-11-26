"use client";

import { Loader2Icon, StickyNoteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateLeadAction } from "@/app/admin/[lang]/(panel)/leads/actions";
import { LEAD_STATUSES, type LeadStatus } from "@/components/admin/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = LeadStatus;

export function LeadStatusSelect({ id, status, name }: { id: string; status: Status; name: string }) {
  const t = useTranslations("Admin.leads");
  const tStatus = useTranslations("Admin.leadStatus");
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={t("statusFor", { name })}
      value={value}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as Status;
        const previous = value;
        setValue(next);
        startTransition(async () => {
          const result = await updateLeadAction({ id, status: next });
          if (result.ok) {
            toast.success(t("statusChanged", { status: tStatus(next) }));
            router.refresh();
          } else {
            setValue(previous);
            toast.error(result.error);
          }
        });
      }}
      className="rounded-sm border bg-background px-2 py-1 text-sm disabled:opacity-60"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {tStatus(s)}
        </option>
      ))}
    </select>
  );
}

export function LeadNoteButton({ id, note, name }: { id: string; note: string | null; name: string }) {
  const t = useTranslations("Admin.leads.noteDialog");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateLeadAction({ id, managerNote: text });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(t("saved"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setText(note ?? "");
          setOpen(true);
        }}
        aria-label={t("buttonFor", { name })}
        className="max-w-48 justify-start"
      >
        <StickyNoteIcon className="shrink-0" />
        <span className="min-w-0 truncate">{note || t("add")}</span>
      </Button>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent>
          <form onSubmit={save} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{name}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`note-${id}`}>{t("label")}</Label>
              <Textarea
                id={`note-${id}`}
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("placeholder")}
              />
            </div>
            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2Icon className="animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
