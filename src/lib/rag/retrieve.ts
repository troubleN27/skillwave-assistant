import { and, cosineDistance, desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { chunks, documents } from "@/db/schema";
import { embedQuery } from "@/lib/ai/embeddings";
import { hasConfidentContext, reciprocalRankFusion } from "./rrf";

export const VECTOR_CANDIDATES = 8;
export const TEXT_CANDIDATES = 8;
export const RESULT_LIMIT = 5;

type Candidate = {
  id: string;
  content: string;
  heading: string | null;
  documentId: string;
  documentTitle: string;
  similarity: number;
};

export type RetrievedChunk = Candidate & {
  score: number;
  vectorRank: number | null;
  textRank: number | null;
};

export type RetrievalResult = {
  chunks: RetrievedChunk[];
  textResultCount: number;
  maxSimilarity: number;
  confident: boolean;
};

/** Hybrid search: vector + full-text, fused with RRF (SPEC 5.2). */
export async function retrieve(
  db: Database,
  question: string,
  minSimilarity: number,
): Promise<RetrievalResult> {
  const embedding = await embedQuery(question);
  const similarity = sql<number>`1 - (${cosineDistance(chunks.embedding, embedding)})`;
  const fields = {
    id: chunks.id,
    content: chunks.content,
    heading: chunks.heading,
    documentId: chunks.documentId,
    documentTitle: documents.title,
    similarity,
  };
  const ready = eq(documents.status, "ready");
  const tsQuery = sql`websearch_to_tsquery('simple', ${question})`;

  const [vectorResults, textResults] = await Promise.all([
    db
      .select(fields)
      .from(chunks)
      .innerJoin(documents, eq(chunks.documentId, documents.id))
      .where(ready)
      .orderBy(cosineDistance(chunks.embedding, embedding))
      .limit(VECTOR_CANDIDATES),
    db
      .select(fields)
      .from(chunks)
      .innerJoin(documents, eq(chunks.documentId, documents.id))
      .where(and(ready, sql`${chunks.tsv} @@ ${tsQuery}`))
      .orderBy(desc(sql`ts_rank(${chunks.tsv}, ${tsQuery})`))
      .limit(TEXT_CANDIDATES),
  ]);

  const normalize = (rows: Candidate[]) =>
    rows.map((row) => ({ ...row, similarity: Number(row.similarity) }));

  const fused = reciprocalRankFusion<Candidate>(
    normalize(vectorResults),
    normalize(textResults),
    RESULT_LIMIT,
  );
  const maxSimilarity = Math.max(0, ...fused.map((c) => c.similarity));

  return {
    chunks: fused,
    textResultCount: textResults.length,
    maxSimilarity,
    confident: hasConfidentContext(fused, minSimilarity, textResults.length),
  };
}
