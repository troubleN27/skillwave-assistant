export const RRF_K = 60;

export type RankedCandidate<T> = T & {
  id: string;
  similarity: number;
};

export type FusedResult<T> = RankedCandidate<T> & {
  score: number;
  /** 1-based position in the vector list, or null if absent. */
  vectorRank: number | null;
  /** 1-based position in the full-text list, or null if absent. */
  textRank: number | null;
};

/**
 * Reciprocal Rank Fusion: score = Σ 1 / (k + rank) over the lists that
 * contain the item. Ties are broken by cosine similarity.
 */
export function reciprocalRankFusion<T>(
  vectorResults: RankedCandidate<T>[],
  textResults: RankedCandidate<T>[],
  limit: number,
  k = RRF_K,
): FusedResult<T>[] {
  const fused = new Map<string, FusedResult<T>>();

  const add = (list: RankedCandidate<T>[], key: "vectorRank" | "textRank") => {
    list.forEach((item, index) => {
      const rank = index + 1;
      const existing =
        fused.get(item.id) ??
        ({ ...item, score: 0, vectorRank: null, textRank: null } as FusedResult<T>);
      existing[key] = rank;
      existing.score += 1 / (k + rank);
      fused.set(item.id, existing);
    });
  };

  add(vectorResults, "vectorRank");
  add(textResults, "textRank");

  return [...fused.values()]
    .sort((a, b) => b.score - a.score || b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Context is "not found" when the best cosine similarity is below the
 * threshold AND full-text search returned nothing (SPEC 5.3).
 */
export function hasConfidentContext(
  results: { similarity: number; textRank: number | null }[],
  minSimilarity: number,
  textResultCount: number,
): boolean {
  if (textResultCount > 0) return true;
  const best = Math.max(-Infinity, ...results.map((r) => r.similarity));
  return best >= minSimilarity;
}
