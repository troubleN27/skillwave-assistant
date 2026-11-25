"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { setUnansweredStatus } from "@/lib/admin/unanswered";
import { formatFaqContent } from "@/lib/rag/chunking";
import { createDocument } from "@/lib/rag/documents";
import { indexDocument } from "@/lib/rag/ingest";
import { requireAdmin } from "@/lib/session";
import { faqDocumentSchema } from "@/lib/validations/knowledge";

export type { ActionResult };

const idsSchema = z.array(z.uuid()).min(1).max(1000);
const statusSchema = z.enum(["new", "ignored"]);

/**
 * Adds a FAQ answer to the knowledge base and marks the whole group of
 * questions as resolved (SPEC 8). The FAQ is indexed after the response.
 */
export async function answerWithFaqAction(ids: unknown, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsedIds = idsSchema.safeParse(ids);
  const parsed = faqDocumentSchema.safeParse(input);
  if (!parsedIds.success) return failure("noQuestions");
  if (!parsed.success) return invalid(parsed.error);

  const { question, answer, language } = parsed.data;
  const documentId = await createDocument(db, {
    title: question,
    sourceType: "faq",
    language,
    content: formatFaqContent(question, answer),
  });
  await setUnansweredStatus(db, parsedIds.data, "resolved", documentId);
  after(() => indexDocument(db, documentId));
  return { ok: true };
}

export async function setUnansweredStatusAction(ids: unknown, status: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsedIds = idsSchema.safeParse(ids);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedIds.success || !parsedStatus.success) return failure("badRequest");
  await setUnansweredStatus(db, parsedIds.data, parsedStatus.data);
  return { ok: true };
}
