import { describe, expect, it } from "vitest";
import { APICallError } from "ai";
import {
  formatDocumentForEmbedding,
  formatQueryForEmbedding,
  getRetryDelayMs,
} from "@/lib/ai/embeddings";
import { hasConfidentContext, reciprocalRankFusion } from "@/lib/rag/rrf";

const item = (id: string, similarity = 0.5) => ({ id, similarity });

describe("reciprocalRankFusion", () => {
  it("ranks items found by both searches first", () => {
    const fused = reciprocalRankFusion(
      [item("a", 0.9), item("b", 0.8), item("c", 0.7)],
      [item("c", 0.7), item("d", 0.4)],
      5,
    );
    expect(fused[0].id).toBe("c");
    expect(fused[0].score).toBeCloseTo(1 / 63 + 1 / 61);
    expect(fused[0]).toMatchObject({ vectorRank: 3, textRank: 1 });
  });

  it("keeps ranks from each list and null when absent", () => {
    const fused = reciprocalRankFusion([item("a")], [item("b")], 5);
    const a = fused.find((r) => r.id === "a");
    const b = fused.find((r) => r.id === "b");
    expect(a).toMatchObject({ vectorRank: 1, textRank: null });
    expect(b).toMatchObject({ vectorRank: null, textRank: 1 });
  });

  it("breaks score ties by similarity and respects the limit", () => {
    const fused = reciprocalRankFusion(
      [item("low", 0.3), item("x", 0.2)],
      [item("high", 0.9), item("y", 0.1)],
      3,
    );
    expect(fused).toHaveLength(3);
    expect(fused[0].id).toBe("high");
    expect(fused[1].id).toBe("low");
  });

  it("returns an empty list for empty inputs", () => {
    expect(reciprocalRankFusion([], [], 5)).toEqual([]);
  });
});

describe("hasConfidentContext", () => {
  const results = [
    { similarity: 0.4, textRank: null },
    { similarity: 0.5, textRank: null },
  ];

  it("is not confident when similarity is low and full-text found nothing", () => {
    expect(hasConfidentContext(results, 0.55, 0)).toBe(false);
  });

  it("is confident when similarity reaches the threshold", () => {
    expect(hasConfidentContext(results, 0.5, 0)).toBe(true);
  });

  it("is confident when full-text search found something", () => {
    expect(hasConfidentContext(results, 0.9, 2)).toBe(true);
  });

  it("is not confident with no results", () => {
    expect(hasConfidentContext([], 0.55, 0)).toBe(false);
  });
});

describe("getRetryDelayMs", () => {
  const rateLimit = (responseBody?: string, headers?: Record<string, string>) =>
    new APICallError({
      message: "quota",
      url: "https://example.test",
      requestBodyValues: {},
      statusCode: 429,
      responseBody,
      responseHeaders: headers,
    });

  it("uses exponential backoff without hints", () => {
    expect(getRetryDelayMs(1)).toBe(2000);
    expect(getRetryDelayMs(2)).toBe(4000);
    expect(getRetryDelayMs(3)).toBe(8000);
  });

  it("follows Gemini retryDelay and Retry-After hints", () => {
    expect(getRetryDelayMs(1, rateLimit('{"retryDelay": "34s"}'))).toBe(34_000);
    expect(getRetryDelayMs(1, rateLimit(undefined, { "retry-after": "12" }))).toBe(12_000);
  });

  it("caps the delay at one minute", () => {
    expect(getRetryDelayMs(1, rateLimit('{"retryDelay": "300s"}'))).toBe(60_000);
  });
});

describe("embedding prefixes", () => {
  it("formats documents and queries as SPEC 4.3 requires", () => {
    expect(
      formatDocumentForEmbedding({
        documentTitle: "Оплата",
        heading: "Рассрочка",
        content: "0% на 12 месяцев.",
      }),
    ).toBe("title: Оплата | text: Рассрочка\n0% на 12 месяцев.");
    expect(
      formatDocumentForEmbedding({ documentTitle: "FAQ", heading: null, content: "Текст" }),
    ).toBe("title: FAQ | text: Текст");
    expect(formatQueryForEmbedding("  Есть ли рассрочка? ")).toBe(
      "task: question answering | query: Есть ли рассрочка?",
    );
  });
});
