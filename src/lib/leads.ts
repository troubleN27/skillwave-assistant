import { and, asc, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, leads, messages } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import {
  formatLeadMessage,
  isTelegramConfigured,
  sendTelegramMessage,
  summarizeConversation,
  type LeadNotification,
} from "@/lib/telegram";
import type { LeadRequest } from "@/lib/validations/lead";

/** Saves a lead; links it to the conversation only if it belongs to the visitor. */
export async function createLead(db: Database, input: LeadRequest) {
  const settings = await getSettings(db);
  const course = (settings.courses ?? []).find((c) => c.id === input.courseId) ?? null;

  let conversationId: string | null = null;
  if (input.conversationId) {
    const [owned] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, input.conversationId),
          eq(conversations.visitorId, input.visitorId),
        ),
      );
    conversationId = owned?.id ?? null;
  }

  const lead = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(leads)
      .values({
        conversationId,
        name: input.name,
        contact: input.contact,
        courseId: course?.id ?? null,
        preferredChannel: input.preferredChannel,
        comment: input.comment || null,
      })
      .returning({ id: leads.id });
    if (conversationId) {
      await tx
        .update(conversations)
        .set({ hasLead: true })
        .where(eq(conversations.id, conversationId));
    }
    return row;
  });

  return {
    leadId: lead.id,
    conversationId,
    courseName: course?.name_ru ?? null,
    telegramEnabled: settings.telegramNotifications,
  };
}

/** Builds and sends the manager notification (runs after the response). */
export async function notifyManager(
  db: Database,
  input: LeadRequest,
  created: Awaited<ReturnType<typeof createLead>>,
) {
  if (!created.telegramEnabled) return;
  if (!isTelegramConfigured()) {
    // Don't spend a model call on a summary nobody will receive.
    console.warn("Telegram is not configured: lead notification skipped");
    return;
  }

  let summary: string | null = null;
  if (created.conversationId) {
    const transcript = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, created.conversationId))
      .orderBy(asc(messages.createdAt));
    summary = await summarizeConversation(transcript);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const notification: LeadNotification = {
    name: input.name,
    contact: input.contact,
    preferredChannel: input.preferredChannel,
    courseName: created.courseName,
    comment: input.comment || null,
    summary,
    conversationUrl:
      siteUrl && created.conversationId
        ? `${siteUrl}/admin/conversations/${created.conversationId}`
        : null,
  };
  await sendTelegramMessage(formatLeadMessage(notification));
}
