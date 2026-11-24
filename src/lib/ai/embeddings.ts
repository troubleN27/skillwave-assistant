import type { GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import { APICallError, embedMany } from "ai";
import { embeddingModel, getEmbeddingDimensions } from "./models";

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60_000;

export type DocumentChunkInput = {
  documentTitle: string;
  heading: string | null;
  content: string;
};

/**
 * `gemini-embedding-2` does not support `taskType`, so the task is encoded
 * with text prefixes (SPEC 4.3).
 */
export function formatDocumentForEmbedding(chunk: DocumentChunkInput): string {
  const text = chunk.heading ? `${chunk.heading}\n${chunk.content}` : chunk.content;
  return `title: ${chunk.documentTitle} | text: ${text}`;
}

export function formatQueryForEmbedding(question: string): string {
  return `task: question answering | query: ${question.trim()}`;
}

function isRateLimitError(error: unknown): boolean {
  return APICallError.isInstance(error) && error.statusCode === 429;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Delay before retry `retry` (1-based): exponential backoff, or the delay
 * suggested by the API (`Retry-After` header or Gemini's `retryDelay`) when it
 * is longer. Gemini free-tier quotas are per minute, so the hint matters.
 */
export function getRetryDelayMs(retry: number, error?: unknown): number {
  let hinted = 0;
  if (APICallError.isInstance(error)) {
    const header = Number(error.responseHeaders?.["retry-after"]);
    if (Number.isFinite(header) && header > 0) hinted = header * 1000;
    const match = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(error.responseBody ?? "");
    if (match) hinted = Math.max(hinted, Number(match[1]) * 1000);
  }
  const backoff = BASE_DELAY_MS * 2 ** (retry - 1);
  return Math.min(Math.max(backoff, hinted), MAX_DELAY_MS);
}

async function embedBatch(values: string[]): Promise<number[][]> {
  for (let retry = 0; ; retry++) {
    try {
      const { embeddings } = await embedMany({
        model: embeddingModel(),
        values,
        maxRetries: 0,
        providerOptions: {
          google: {
            outputDimensionality: getEmbeddingDimensions(),
          } satisfies GoogleEmbeddingModelOptions,
        },
      });
      return embeddings;
    } catch (error) {
      if (!isRateLimitError(error) || retry >= MAX_RETRIES) throw error;
      await sleep(getRetryDelayMs(retry + 1, error));
    }
  }
}

async function embedValues(values: string[]): Promise<number[][]> {
  const result: number[][] = [];
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    result.push(...(await embedBatch(values.slice(i, i + BATCH_SIZE))));
  }
  return result;
}

export function embedDocumentChunks(chunks: DocumentChunkInput[]) {
  return embedValues(chunks.map(formatDocumentForEmbedding));
}

export async function embedQuery(question: string): Promise<number[]> {
  const [embedding] = await embedValues([formatQueryForEmbedding(question)]);
  return embedding;
}

/** Human-readable message for errors coming from the embedding API. */
export function describeEmbeddingError(error: unknown): string {
  if (isRateLimitError(error)) {
    return "Превышен лимит запросов к Gemini API. Попробуйте переиндексировать позже";
  }
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 400 || error.statusCode === 403) {
      return `Gemini API отклонил запрос (${error.statusCode}): проверьте ключ API и название модели`;
    }
    return `Ошибка Gemini API (${error.statusCode ?? "нет ответа"}): ${error.message}`;
  }
  if (error instanceof Error && error.message.includes("GOOGLE_GENERATIVE_AI_API_KEY")) {
    return "Не задан ключ Gemini API (GOOGLE_GENERATIVE_AI_API_KEY)";
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
