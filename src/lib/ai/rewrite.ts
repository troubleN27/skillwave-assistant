import { generateText } from "ai";
import { chatModel } from "./models";

export type HistoryMessage = { role: "user" | "assistant"; content: string };

const REWRITE_TIMEOUT_MS = 8000;

const REWRITE_SYSTEM = `You rewrite the visitor's last message into a standalone search query for the knowledge base of an online school.
- Resolve pronouns and references using the conversation (e.g. "how much is it?" → "How much does the Python Developer course cost?").
- Keep the language of the last message. Keep it short (one sentence).
- If the message is already standalone or is not a question, return it unchanged.
- Output only the rewritten text, nothing else.`;

/**
 * Turns a follow-up question into a standalone one using the last messages
 * (SPEC 5.1, step 3). Falls back to the original question on any error.
 */
export async function rewriteQuestion(
  history: HistoryMessage[],
  question: string,
): Promise<string> {
  if (history.length === 0) return question;

  const transcript = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: chatModel(),
      system: REWRITE_SYSTEM,
      prompt: `Conversation:\n${transcript}\n\nLast message: ${question}\n\nStandalone query:`,
      maxRetries: 1,
      maxOutputTokens: 120,
      temperature: 0,
      // A slow rewrite must not delay the answer: fall back to the original question.
      abortSignal: AbortSignal.timeout(REWRITE_TIMEOUT_MS),
    });
    const rewritten = text.trim().replace(/^["«]|["»]$/g, "");
    return rewritten && rewritten.length <= 1000 ? rewritten : question;
  } catch (error) {
    console.error("Question rewrite failed", error);
    return question;
  }
}
