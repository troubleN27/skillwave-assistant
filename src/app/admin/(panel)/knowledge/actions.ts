"use server";

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { formatFaqContent } from "@/lib/rag/chunking";
import {
  createDocument,
  deleteDocument,
  listDocumentChunks,
  updateDocument,
} from "@/lib/rag/documents";
import { indexDocument } from "@/lib/rag/ingest";
import { requireAdmin } from "@/lib/session";
import {
  documentIdSchema,
  faqDocumentSchema,
  fileDocumentSchema,
  renameDocumentSchema,
  textDocumentSchema,
} from "@/lib/validations/knowledge";

export type ActionResult = { ok: true } | { ok: false; error: string };

function invalid(error: { issues: { message: string }[] }): ActionResult {
  return { ok: false, error: error.issues[0]?.message ?? "Проверьте поля формы" };
}

/** Indexing runs after the response, so the UI shows "processing" right away. */
function scheduleIndexing(documentId: string) {
  after(() => indexDocument(db, documentId));
}

export async function createTextDocumentAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = textDocumentSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const id = await createDocument(db, { ...parsed.data, sourceType: "text" });
  scheduleIndexing(id);
  return { ok: true };
}

export async function createFaqDocumentAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = faqDocumentSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { question, answer, language } = parsed.data;
  const id = await createDocument(db, {
    title: question,
    sourceType: "faq",
    language,
    content: formatFaqContent(question, answer),
  });
  scheduleIndexing(id);
  return { ok: true };
}

export async function createFileDocumentAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = fileDocumentSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { blobUrl, ...rest } = parsed.data;
  // Content is extracted from the stored file during indexing.
  const id = await createDocument(db, { ...rest, content: "", fileUrl: blobUrl });
  scheduleIndexing(id);
  return { ok: true };
}

export async function updateTextDocumentAction(
  id: unknown,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const docId = documentIdSchema.safeParse(id);
  if (!docId.success) return invalid(docId.error);

  const [doc] = await db
    .select({ sourceType: documents.sourceType })
    .from(documents)
    .where(eq(documents.id, docId.data));
  if (!doc) return { ok: false, error: "Документ не найден" };

  if (doc.sourceType === "faq") {
    const parsed = faqDocumentSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const { question, answer, language } = parsed.data;
    await updateDocument(db, docId.data, {
      title: question,
      language,
      content: formatFaqContent(question, answer),
    });
  } else if (doc.sourceType === "pdf" || doc.sourceType === "docx") {
    const parsed = renameDocumentSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    await updateDocument(db, docId.data, parsed.data);
  } else {
    const parsed = textDocumentSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    await updateDocument(db, docId.data, parsed.data);
  }

  scheduleIndexing(docId.data);
  return { ok: true };
}

export async function reindexDocumentAction(id: unknown): Promise<ActionResult> {
  await requireAdmin();
  const docId = documentIdSchema.safeParse(id);
  if (!docId.success) return invalid(docId.error);

  await db
    .update(documents)
    .set({ status: "processing", error: null })
    .where(eq(documents.id, docId.data));
  scheduleIndexing(docId.data);
  return { ok: true };
}

export async function deleteDocumentAction(id: unknown): Promise<ActionResult> {
  await requireAdmin();
  const docId = documentIdSchema.safeParse(id);
  if (!docId.success) return invalid(docId.error);

  const deleted = await deleteDocument(db, docId.data);
  return deleted ? { ok: true } : { ok: false, error: "Документ не найден" };
}

export async function getDocumentChunksAction(id: unknown) {
  await requireAdmin();
  const docId = documentIdSchema.safeParse(id);
  if (!docId.success) return [];
  return listDocumentChunks(db, docId.data);
}
