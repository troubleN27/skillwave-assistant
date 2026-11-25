import { and, desc, eq, gte, inArray } from "drizzle-orm";
import type { Database } from "@/db/client";
import { messages, unansweredQuestions } from "@/db/schema";

export type UnansweredStatus = "new" | "resolved" | "ignored";
export type UnansweredReason = "no_context" | "negative_feedback";

export type UnansweredRow = {
  id: string;
  question: string;
  reason: UnansweredReason;
  createdAt: Date;
  conversationId: string | null;
};

export type UnansweredGroup = {
  key: string;
  /** Most recent wording of the question. */
  question: string;
  count: number;
  reasons: UnansweredReason[];
  lastAt: Date;
  ids: string[];
  conversationIds: string[];
};

/** Normalizes a question so that trivially different wordings fall into one group. */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Groups similar questions; most frequent first, then most recent. */
export function groupUnanswered(rows: UnansweredRow[]): UnansweredGroup[] {
  const groups = new Map<string, UnansweredGroup>();
  const sorted = [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  for (const row of sorted) {
    const key = normalizeQuestion(row.question) || row.id;
    const group = groups.get(key);
    if (!group) {
      groups.set(key, {
        key,
        question: row.question,
        count: 1,
        reasons: [row.reason],
        lastAt: row.createdAt,
        ids: [row.id],
        conversationIds: row.conversationId ? [row.conversationId] : [],
      });
      continue;
    }
    group.count += 1;
    group.ids.push(row.id);
    if (!group.reasons.includes(row.reason)) group.reasons.push(row.reason);
    if (row.conversationId && !group.conversationIds.includes(row.conversationId)) {
      group.conversationIds.push(row.conversationId);
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || b.lastAt.getTime() - a.lastAt.getTime(),
  );
}

const MAX_ROWS = 1000;

export async function listUnansweredGroups(
  db: Database,
  status: UnansweredStatus,
  from?: Date,
): Promise<UnansweredGroup[]> {
  const rows = await db
    .select({
      id: unansweredQuestions.id,
      question: unansweredQuestions.question,
      reason: unansweredQuestions.reason,
      createdAt: unansweredQuestions.createdAt,
      conversationId: messages.conversationId,
    })
    .from(unansweredQuestions)
    .leftJoin(messages, eq(unansweredQuestions.messageId, messages.id))
    .where(
      from
        ? and(eq(unansweredQuestions.status, status), gte(unansweredQuestions.createdAt, from))
        : eq(unansweredQuestions.status, status),
    )
    .orderBy(desc(unansweredQuestions.createdAt))
    .limit(MAX_ROWS);
  return groupUnanswered(rows);
}

export async function setUnansweredStatus(
  db: Database,
  ids: string[],
  status: UnansweredStatus,
  resolvedDocumentId: string | null = null,
) {
  if (ids.length === 0) return;
  await db
    .update(unansweredQuestions)
    .set({ status, resolvedDocumentId: status === "resolved" ? resolvedDocumentId : null })
    .where(inArray(unansweredQuestions.id, ids));
}
