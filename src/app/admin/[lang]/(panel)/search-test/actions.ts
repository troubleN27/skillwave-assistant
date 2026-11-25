"use server";

import { db } from "@/db";
import { invalid } from "@/lib/admin/action-result";
import { describeEmbeddingError } from "@/lib/ai/embeddings";
import { retrieve, type RetrievalResult } from "@/lib/rag/retrieve";
import { requireAdmin } from "@/lib/session";
import { getMinSimilarity } from "@/lib/settings";
import { searchTestSchema } from "@/lib/validations/knowledge";

export type SearchTestResult =
  | { ok: true; question: string; minSimilarity: number; result: RetrievalResult }
  | { ok: false; error: string };

export async function runSearchTestAction(input: unknown): Promise<SearchTestResult> {
  await requireAdmin();
  const parsed = searchTestSchema.safeParse(input);
  if (!parsed.success) {
    const result = await invalid(parsed.error);
    return { ok: false, error: result.ok ? "" : result.error };
  }

  try {
    const minSimilarity = await getMinSimilarity(db);
    const result = await retrieve(db, parsed.data.question, minSimilarity);
    return { ok: true, question: parsed.data.question, minSimilarity, result };
  } catch (error) {
    return { ok: false, error: describeEmbeddingError(error) };
  }
}
