"use server";

import { z } from "zod";
import { db } from "@/db";
import { updateLead } from "@/lib/admin/leads";
import { requireAdmin } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(["new", "in_progress", "closed"]).optional(),
  managerNote: z
    .string()
    .trim()
    .max(2000, "Заметка — максимум 2000 символов")
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null)),
});

export async function updateLeadAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректный запрос" };
  }
  const { id, ...data } = parsed.data;
  const updated = await updateLead(db, id, data);
  return updated ? { ok: true } : { ok: false, error: "Заявка не найдена" };
}
