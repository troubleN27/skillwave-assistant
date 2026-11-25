import { and, asc, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, messages } from "@/db/schema";
import type { ChatSource, ChatUIMessage } from "./types";

type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: { documentId: string; title: string }[] | null;
  answered: boolean | null;
  feedback: "up" | "down" | null;
};

function uniqueSources(sources: MessageRow["sources"]): ChatSource[] {
  const seen = new Map<string, ChatSource>();
  for (const s of sources ?? []) {
    if (!seen.has(s.documentId)) seen.set(s.documentId, { documentId: s.documentId, title: s.title });
  }
  return [...seen.values()];
}

/** Converts stored rows into UI messages in the same shape the chat stream produces. */
export function toUIMessages(rows: MessageRow[]): ChatUIMessage[] {
  return rows.map((row) => {
    if (row.role === "user") {
      return { id: row.id, role: "user", parts: [{ type: "text", text: row.content }] };
    }
    const parts: ChatUIMessage["parts"] = [{ type: "text", text: row.content }];
    const sources = uniqueSources(row.sources);
    if (row.answered && sources.length) parts.push({ type: "data-sources", data: sources });
    parts.push({
      type: "data-meta",
      data: { messageId: row.id, answered: row.answered, feedback: row.feedback },
    });
    return { id: row.id, role: "assistant", parts };
  });
}

/** Messages of a conversation owned by the visitor, or null if it isn't theirs. */
export async function loadConversationMessages(
  db: Database,
  conversationId: string,
  visitorId: string,
): Promise<ChatUIMessage[] | null> {
  const [conversation] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.visitorId, visitorId)));
  if (!conversation) return null;

  const rows = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      sources: messages.sources,
      answered: messages.answered,
      feedback: messages.feedback,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
  return toUIMessages(rows);
}
