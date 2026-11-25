"use client";

import { Loader2Icon, StickyNoteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateLeadAction } from "@/app/admin/(panel)/leads/actions";
import { LEAD_STATUS_LABELS } from "@/components/admin/format";
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

type Status = keyof typeof LEAD_STATUS_LABELS;

export function LeadStatusSelect({ id, status, name }: { id: string; status: Status; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={`Статус заявки: ${name}`}
      value={value}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as Status;
        const previous = value;
        setValue(next);
        startTransition(async () => {
          const result = await updateLeadAction({ id, status: next });
          if (result.ok) {
            toast.success(`Статус: ${LEAD_STATUS_LABELS[next]}`);
            router.refresh();
          } else {
            setValue(previous);
            toast.error(result.error);
          }
        });
      }}
      className="rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-60"
    >
      {(Object.keys(LEAD_STATUS_LABELS) as Status[]).map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

export function LeadNoteButton({ id, note, name }: { id: string; note: string | null; name: string }) {
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
      toast.success("Заметка сохранена");
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
        aria-label={`Заметка к заявке: ${name}`}
        className="max-w-48 justify-start"
      >
        <StickyNoteIcon className="shrink-0" />
        <span className="truncate">{note || "Добавить"}</span>
      </Button>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent>
          <form onSubmit={save} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Заметка менеджера</DialogTitle>
              <DialogDescription>{name}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`note-${id}`}>Заметка</Label>
              <Textarea
                id={`note-${id}`}
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Например: перезвонить в четверг после 18:00"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
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
    </>
  );
}
