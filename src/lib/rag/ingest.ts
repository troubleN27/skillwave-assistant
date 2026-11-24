import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { chunks, documents } from "@/db/schema";
import { describeEmbeddingError, embedDocumentChunks } from "@/lib/ai/embeddings";
import { chunkFaq, chunkText } from "./chunking";
import { ExtractionError, extractTextFromFile } from "./extract";
import { FILE_SOURCE_TYPES, type FileSourceType } from "./file-types";

type DocumentRow = typeof documents.$inferSelect;

function isFileType(type: DocumentRow["sourceType"]): type is FileSourceType {
  return (FILE_SOURCE_TYPES as readonly string[]).includes(type);
}

async function downloadBlob(url: string): Promise<ArrayBuffer> {
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200) {
    throw new ExtractionError("Исходный файл не найден в хранилище");
  }
  return new Response(result.stream).arrayBuffer();
}

/** Text of the document; for uploaded files it is extracted on first indexing. */
async function resolveContent(db: Database, doc: DocumentRow): Promise<string> {
  if (doc.content.trim() || !isFileType(doc.sourceType) || !doc.fileUrl) {
    return doc.content;
  }
  const text = await extractTextFromFile(await downloadBlob(doc.fileUrl), doc.sourceType);
  await db.update(documents).set({ content: text }).where(eq(documents.id, doc.id));
  return text;
}

function describeError(error: unknown): string {
  if (error instanceof ExtractionError) return error.message;
  return describeEmbeddingError(error);
}

/**
 * Reads, chunks and embeds a document, then atomically replaces its chunks
 * (SPEC 4.4). Never throws: failures are stored in `documents.error`.
 */
export async function indexDocument(db: Database, documentId: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
  if (!doc) return { ok: false as const, error: "Документ не найден" };

  await db
    .update(documents)
    .set({ status: "processing", error: null })
    .where(eq(documents.id, documentId));

  try {
    const content = await resolveContent(db, doc);
    const pieces = doc.sourceType === "faq" ? chunkFaq(content) : chunkText(content);
    if (pieces.length === 0) throw new ExtractionError("Документ пустой");

    const embeddings = await embedDocumentChunks(
      pieces.map((piece) => ({
        documentTitle: doc.title,
        heading: piece.heading,
        content: piece.content,
      })),
    );

    await db.transaction(async (tx) => {
      await tx.delete(chunks).where(eq(chunks.documentId, documentId));
      await tx.insert(chunks).values(
        pieces.map((piece, i) => ({
          documentId,
          position: piece.position,
          heading: piece.heading,
          content: piece.content,
          embedding: embeddings[i],
        })),
      );
      await tx
        .update(documents)
        .set({ status: "ready", chunkCount: pieces.length, error: null })
        .where(eq(documents.id, documentId));
    });

    return { ok: true as const, chunkCount: pieces.length };
  } catch (error) {
    const message = describeError(error);
    await db
      .update(documents)
      .set({ status: "error", error: message })
      .where(eq(documents.id, documentId));
    return { ok: false as const, error: message };
  }
}
