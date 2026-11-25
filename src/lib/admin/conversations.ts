import { and, asc, count, desc, eq, gte, type SQL } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, leads, messages } from "@/db/schema";

export const CONVERSATIONS_PAGE_SIZE = 25;

export type ConversationFilters = {
  from: Date;
  locale?: "ru" | "en";
  hasLead?: boolean;
  unanswered?: boolean;
  negative?: boolean;
  page: number;
};

export async function listConversations(db: Database, filters: ConversationFilters) {
  const conditions: SQL[] = [gte(conversations.createdAt, filters.from)];
  if (filters.locale) conditions.push(eq(conversations.locale, filters.locale));
  if (filters.hasLead) conditions.push(eq(conversations.hasLead, true));
  if (filters.unanswered) conditions.push(eq(conversations.hasUnanswered, true));
  if (filters.negative) conditions.push(eq(conversations.hasNegativeFeedback, true));
  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: conversations.id,
        createdAt: conversations.createdAt,
        lastMessageAt: conversations.lastMessageAt,
        locale: conversations.locale,
        pageUrl: conversations.pageUrl,
        origin: conversations.origin,
        messageCount: conversations.messageCount,
        hasLead: conversations.hasLead,
        hasUnanswered: conversations.hasUnanswered,
        hasNegativeFeedback: conversations.hasNegativeFeedback,
      })
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(CONVERSATIONS_PAGE_SIZE)
      .offset((filters.page - 1) * CONVERSATIONS_PAGE_SIZE),
    db.select({ total: count() }).from(conversations).where(where),
  ]);

  return { rows, total: Number(total) };
}

export async function getConversationDetail(db: Database, id: string) {
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conversation) return null;

  const [items, leadRows] = await Promise.all([
    db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        sources: messages.sources,
        answered: messages.answered,
        feedback: messages.feedback,
        latencyMs: messages.latencyMs,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt)),
    db.select().from(leads).where(eq(leads.conversationId, id)).orderBy(desc(leads.createdAt)),
  ]);

  return { conversation, messages: items, leads: leadRows };
}
