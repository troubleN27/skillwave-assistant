import { del } from "@vercel/blob";
import { asc, desc, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { chunks, documents } from "@/db/schema";

export type DocumentSourceType = (typeof documents.$inferInsert)["sourceType"];
export type DocumentLanguage = (typeof documents.$inferInsert)["language"];

export type NewDocument = {
  title: string;
  sourceType: DocumentSourceType;
  language: DocumentLanguage;
  content: string;
  fileUrl?: string | null;
};

export function listDocuments(db: Database) {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      sourceType: documents.sourceType,
      language: documents.language,
      content: documents.content,
      status: documents.status,
      error: documents.error,
      chunkCount: documents.chunkCount,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .orderBy(desc(documents.updatedAt));
}

export function listDocumentChunks(db: Database, documentId: string) {
  return db
    .select({
      id: chunks.id,
      position: chunks.position,
      heading: chunks.heading,
      content: chunks.content,
    })
    .from(chunks)
    .where(eq(chunks.documentId, documentId))
    .orderBy(asc(chunks.position));
}

export async function createDocument(db: Database, input: NewDocument) {
  const [row] = await db
    .insert(documents)
    .values({ ...input, status: "processing" })
    .returning({ id: documents.id });
  return row.id;
}

export async function updateDocument(
  db: Database,
  id: string,
  input: Partial<Pick<NewDocument, "title" | "language" | "content">>,
) {
  await db
    .update(documents)
    .set({ ...input, status: "processing", error: null })
    .where(eq(documents.id, id));
}

export async function findDocumentByTitle(db: Database, title: string) {
  const [row] = await db
    .select({
      id: documents.id,
      content: documents.content,
      language: documents.language,
      status: documents.status,
    })
    .from(documents)
    .where(eq(documents.title, title))
    .limit(1);
  return row ?? null;
}

/** Deletes a document, its chunks (cascade) and the source file in Blob. */
export async function deleteDocument(db: Database, id: string) {
  const [row] = await db
    .delete(documents)
    .where(eq(documents.id, id))
    .returning({ fileUrl: documents.fileUrl });
  if (row?.fileUrl) {
    try {
      await del(row.fileUrl);
    } catch (error) {
      console.error("Failed to delete blob", error);
    }
  }
  return Boolean(row);
}
