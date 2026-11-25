"use server";

import { z } from "zod";
import { db } from "@/db";
import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { updateLead } from "@/lib/admin/leads";
import { requireAdmin } from "@/lib/session";

export type { ActionResult };

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(["new", "in_progress", "closed"]).optional(),
  managerNote: z
    .string()
    .trim()
    .max(2000, "noteMax")
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null)),
});

export async function updateLeadAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...data } = parsed.data;
  const updated = await updateLead(db, id, data);
  return updated ? { ok: true } : failure("leadNotFound");
}
