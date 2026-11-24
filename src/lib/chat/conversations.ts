import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, messages, unansweredQuestions } from "@/db/schema";
import type { HistoryMessage } from "@/lib/ai/rewrite";
import type { ChatSource } from "./types";

export const HISTORY_LIMIT = 6;

export class ConversationAccessError extends Error {}

type Conversation = typeof conversations.$inferSelect;

/**
 * Returns the conversation with this id, creating it on first message.
 * A conversation belongs to one visitor: another visitorId gets an error.
 */
export async function getOrCreateConversation(
  db: Database,
  input: {
    id: string;
    visitorId: string;
    locale: string;
    pageUrl?: string;
    origin: string | null;
  },
): Promise<Conversation> {
  await db
    .insert(conversations)
    .values({
      id: input.id,
      visitorId: input.visitorId,
      locale: input.locale,
      pageUrl: input.pageUrl,
      origin: input.origin,
    })
    .onConflictDoNothing({ target: conversations.id });

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, input.id));
  if (!conversation || conversation.visitorId !== input.visitorId) {
    throw new ConversationAccessError("Conversation belongs to another visitor");
  }
  return conversation;
}

export async function countUserMessages(db: Database, conversationId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.role, "user")));
  return row?.value ?? 0;
}

/** Last messages before `beforeId` (oldest first), used for question rewriting and the model. */
export async function loadHistory(
  db: Database,
  conversationId: string,
  beforeCreatedAt: Date,
): Promise<HistoryMessage[]> {
  const rows = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(
      and(eq(messages.conversationId, conversationId), lt(messages.createdAt, beforeCreatedAt)),
    )
    .orderBy(desc(messages.createdAt))
    .limit(HISTORY_LIMIT);
  return rows.reverse();
}

export async function saveUserMessage(db: Database, conversationId: string, content: string) {
  const [row] = await db
    .insert(messages)
    .values({ conversationId, role: "user", content })
    .returning({ id: messages.id, createdAt: messages.createdAt });
  await db
    .update(conversations)
    .set({
      messageCount: sql`${conversations.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
  return row;
}

export type AssistantMessageInput = {
  conversationId: string;
  content: string;
  sources: (ChatSource & { chunkId: string; similarity: number })[] | null;
  answered: boolean | null;
  latencyMs: number;
  /** When set, the question is recorded as unanswered (SPEC 5.1, step 5). */
  unansweredQuestion?: string;
};

export async function saveAssistantMessage(db: Database, input: AssistantMessageInput) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        role: "assistant",
        content: input.content,
        sources: input.sources,
        answered: input.answered,
        latencyMs: input.latencyMs,
      })
      .returning({ id: messages.id });

    if (input.unansweredQuestion) {
      await tx.insert(unansweredQuestions).values({
        messageId: row.id,
        question: input.unansweredQuestion,
        reason: "no_context",
      });
    }

    await tx
      .update(conversations)
      .set({
        messageCount: sql`${conversations.messageCount} + 1`,
        lastMessageAt: new Date(),
        ...(input.unansweredQuestion ? { hasUnanswered: true } : {}),
      })
      .where(eq(conversations.id, input.conversationId));

    return row.id;
  });
}
