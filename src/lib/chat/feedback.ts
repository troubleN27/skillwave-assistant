import { and, desc, eq, lt } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, messages, unansweredQuestions } from "@/db/schema";

export type FeedbackResult = "ok" | "not_found";

/**
 * Stores 👍/👎 for an assistant message owned by the visitor (SPEC 5.8).
 * 👎 records the preceding visitor question as unanswered (once per message).
 */
export async function saveFeedback(
  db: Database,
  input: { messageId: string; visitorId: string; value: "up" | "down" },
): Promise<FeedbackResult> {
  const [target] = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        eq(messages.id, input.messageId),
        eq(messages.role, "assistant"),
        eq(conversations.visitorId, input.visitorId),
      ),
    );
  if (!target) return "not_found";

  await db.transaction(async (tx) => {
    await tx.update(messages).set({ feedback: input.value }).where(eq(messages.id, target.id));
    if (input.value !== "down") return;

    await tx
      .update(conversations)
      .set({ hasNegativeFeedback: true })
      .where(eq(conversations.id, target.conversationId));

    const [existing] = await tx
      .select({ id: unansweredQuestions.id })
      .from(unansweredQuestions)
      .where(
        and(
          eq(unansweredQuestions.messageId, target.id),
          eq(unansweredQuestions.reason, "negative_feedback"),
        ),
      );
    if (existing) return;

    const [question] = await tx
      .select({ content: messages.content })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, target.conversationId),
          eq(messages.role, "user"),
          lt(messages.createdAt, target.createdAt),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);
    if (!question) return;

    await tx.insert(unansweredQuestions).values({
      messageId: target.id,
      question: question.content,
      reason: "negative_feedback",
    });
  });

  return "ok";
}
