import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  type UIMessageStreamWriter,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { describeEmbeddingError } from "@/lib/ai/embeddings";
import { chatModel } from "@/lib/ai/models";
import {
  buildSystemPrompt,
  cannedReply,
  formatContext,
  suggestsLeadForm,
} from "@/lib/ai/prompts";
import { rewriteQuestion } from "@/lib/ai/rewrite";
import {
  ConversationAccessError,
  countUserMessages,
  getOrCreateConversation,
  loadHistory,
  saveAssistantMessage,
  saveUserMessage,
} from "@/lib/chat/conversations";
import type { MessageSource } from "@/db/schema";
import { visibleSources } from "@/lib/chat/sources";
import type { ChatUIMessage, LeadFormReason } from "@/lib/chat/types";
import { detectLanguage } from "@/lib/language";
import { checkMessageLimits, getClientIp } from "@/lib/rate-limit";
import { retrieve, type RetrievedChunk } from "@/lib/rag/retrieve";
import { getSettings, isAllowedOrigin } from "@/lib/settings";
import { chatRequestSchema } from "@/lib/validations/chat";

export const maxDuration = 60;

const GENERATION_TIMEOUT_MS = 45_000;

type Writer = UIMessageStreamWriter<ChatUIMessage>;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function writeText(writer: Writer, text: string) {
  const id = crypto.randomUUID();
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}

function writeLeadForm(writer: Writer, reason: LeadFormReason, courseId?: string) {
  writer.write({ type: "data-lead-form", data: { reason, ...(courseId ? { courseId } : {}) } });
}

function toMessageSources(chunks: RetrievedChunk[]): MessageSource[] {
  return chunks.map((c) => ({
    documentId: c.documentId,
    title: c.documentTitle,
    language: c.documentLanguage,
    chunkId: c.id,
    similarity: Number(c.similarity.toFixed(4)),
  }));
}

/** A short canned reply streamed without calling the model. */
function cannedResponse(text: string, reason: LeadFormReason, messageId: string | null = null) {
  const stream = createUIMessageStream<ChatUIMessage>({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writeText(writer, text);
      writeLeadForm(writer, reason);
      writer.write({ type: "data-meta", data: { messageId, answered: null } });
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const settings = await getSettings(db);

  // 1. Origin, input and limits (SPEC 5.1, 5.6).
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, process.env.NEXT_PUBLIC_SITE_URL, settings.allowedOrigins)) {
    return jsonError("Запросы с этого сайта не разрешены", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Некорректный запрос", 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Некорректный запрос", 400);
  }
  const input = parsed.data;
  const language = detectLanguage(input.text, input.locale);

  // 2. Conversation and visitor message.
  let conversationId: string;
  try {
    const conversation = await getOrCreateConversation(db, {
      id: input.id,
      visitorId: input.visitorId,
      locale: input.locale,
      pageUrl: input.pageUrl,
      origin,
    });
    conversationId = conversation.id;
  } catch (error) {
    if (error instanceof ConversationAccessError) return jsonError("Диалог недоступен", 403);
    throw error;
  }

  const limits = await checkMessageLimits(db, {
    visitorId: input.visitorId,
    ip: getClientIp(request.headers),
    userMessagesInConversation: await countUserMessages(db, conversationId),
    maxPerConversation: settings.maxMessagesPerConversation,
    maxPerDay: settings.maxMessagesPerDay,
  });
  if (!limits.ok) {
    const kind = {
      visitor: "limitVisitor",
      ip: "limitVisitor",
      conversation: "limitConversation",
      site: "limitSite",
    } as const;
    return cannedResponse(cannedReply(kind[limits.scope], language), "limit");
  }

  const userMessage = await saveUserMessage(db, conversationId, input.text);
  const history = await loadHistory(db, conversationId, userMessage.createdAt);

  // 3–4. Rewrite follow-ups into a standalone question, then hybrid search.
  let retrieval: Awaited<ReturnType<typeof retrieve>>;
  try {
    const query = await rewriteQuestion(history, input.text);
    retrieval = await retrieve(db, query, settings.minSimilarity);
  } catch (error) {
    console.error("Retrieval failed:", describeEmbeddingError(error));
    const text = cannedReply("overloaded", language);
    const messageId = await saveAssistantMessage(db, {
      conversationId,
      content: text,
      sources: null,
      answered: null,
      latencyMs: Date.now() - startedAt,
    });
    return cannedResponse(text, "error", messageId);
  }

  // 5. No confident context: canned answer, lead form, unanswered question.
  if (!retrieval.confident) {
    const text = cannedReply("noContext", language);
    const messageId = await saveAssistantMessage(db, {
      conversationId,
      content: text,
      sources: null,
      answered: false,
      latencyMs: Date.now() - startedAt,
      unansweredQuestion: input.text,
    });
    const stream = createUIMessageStream<ChatUIMessage>({
      execute: ({ writer }) => {
        writer.write({ type: "start" });
        writeText(writer, text);
        writeLeadForm(writer, "no_context");
        writer.write({ type: "data-meta", data: { messageId, answered: false } });
        writer.write({ type: "finish" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  // 6–7. Generate a streamed answer from the retrieved context.
  const storedSources = toMessageSources(retrieval.chunks);
  const sources = visibleSources(storedSources, language);
  const courseIds = new Set((settings.courses ?? []).map((c) => c.id));
  const system = buildSystemPrompt(
    {
      assistantName: settings.assistantName,
      contactsRu: settings.contactsRu,
      contactsEn: settings.contactsEn,
      courses: settings.courses ?? [],
    },
    formatContext(retrieval.chunks),
    language,
  );

  const stream = createUIMessageStream<ChatUIMessage>({
    execute: async ({ writer }) => {
      let answer = "";
      let firstTokenAt: number | null = null;
      let failure: unknown = null;
      let leadFormShown = false;
      // Text block still open when the model fails midway; it must be closed.
      let openTextId: string | null = null;

      writer.write({ type: "start" });
      try {
        const result = streamText({
          model: chatModel(),
          system,
          messages: [
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: input.text },
          ],
          tools: {
            show_lead_form: tool({
              description:
                "Show the lead form in the chat so the visitor can leave contact details for a manager. Use when the visitor wants to enroll, get a consultation, talk to a person, or when you cannot answer.",
              inputSchema: z.object({
                courseId: z.string().optional().describe("Course id from the list, if known"),
                reason: z.string().describe("Short reason, e.g. enrollment or consultation"),
              }),
              execute: async ({ courseId }) => {
                if (!leadFormShown) {
                  leadFormShown = true;
                  writeLeadForm(
                    writer,
                    "requested",
                    courseId && courseIds.has(courseId) ? courseId : undefined,
                  );
                }
                return { shown: true };
              },
            }),
          },
          stopWhen: isStepCount(2),
          temperature: 0.3,
          maxRetries: 1,
          // Stay within maxDuration: on timeout the visitor gets the "overloaded" reply.
          abortSignal: AbortSignal.timeout(GENERATION_TIMEOUT_MS),
        });

        for await (const part of result.stream) {
          switch (part.type) {
            case "text-start":
              openTextId = part.id;
              writer.write({ type: "text-start", id: part.id });
              break;
            case "text-delta":
              firstTokenAt ??= Date.now();
              answer += part.text;
              writer.write({ type: "text-delta", id: part.id, delta: part.text });
              break;
            case "text-end":
              openTextId = null;
              writer.write({ type: "text-end", id: part.id });
              break;
            case "error":
              failure = part.error;
              break;
            // The timeout aborts the stream without an error part.
            case "abort":
              failure ??= new Error(`Generation aborted${part.reason ? `: ${part.reason}` : ""}`);
              break;
          }
        }
      } catch (error) {
        failure = error;
      }

      if (failure) console.error("Chat generation failed:", describeEmbeddingError(failure));

      // failed: nothing was written; interrupted: the model stopped midway.
      const failed = Boolean(failure) && !answer.trim();
      const interrupted = Boolean(failure) && !failed;
      if (failed) {
        answer = cannedReply("overloaded", language);
        writeText(writer, answer);
        if (!leadFormShown) writeLeadForm(writer, "error");
      } else if (interrupted) {
        // Never pass a cut-off answer off as complete: mark it and offer the form.
        if (openTextId) writer.write({ type: "text-end", id: openTextId });
        const note = cannedReply("interrupted", language);
        writeText(writer, `\n\n${note}`);
        answer = `${answer.trimEnd()}\n\n${note}`;
        if (!leadFormShown) writeLeadForm(writer, "error");
      } else {
        if (!leadFormShown && suggestsLeadForm(answer)) {
          leadFormShown = true;
          writeLeadForm(writer, "requested");
        }
        writer.write({ type: "data-sources", data: sources });
      }

      const messageId = await saveAssistantMessage(db, {
        conversationId,
        content: answer.trim(),
        sources: failed || interrupted ? null : storedSources,
        answered: failed || interrupted ? null : true,
        latencyMs: (firstTokenAt ?? Date.now()) - startedAt,
      });

      writer.write({
        type: "data-meta",
        data: { messageId, answered: failed || interrupted ? null : true },
      });
      writer.write({ type: "finish" });
    },
    onError: (error) => {
      console.error("Chat stream error:", error);
      return cannedReply("overloaded", language);
    },
  });

  return createUIMessageStreamResponse({ stream });
}
