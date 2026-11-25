"use server";

import { updateTag } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { SETTINGS_CACHE_TAG } from "@/lib/chat/widget-config";
import { requireAdmin } from "@/lib/session";
import { settingsSchema } from "@/lib/validations/settings";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Saves all assistant settings; the widget sees them on the next request. */
export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" };
  }

  await db
    .insert(settings)
    .values({ id: 1, ...parsed.data })
    .onConflictDoUpdate({ target: settings.id, set: parsed.data });

  // Expire the cached widget config immediately (welcome, quick questions, courses).
  updateTag(SETTINGS_CACHE_TAG);
  return { ok: true };
}
