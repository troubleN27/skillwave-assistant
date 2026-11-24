import { google } from "@ai-sdk/google";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
}

export function getChatModelId(): string {
  return process.env.GEMINI_CHAT_MODEL || "gemini-3.5-flash-lite";
}

export function getEmbeddingModelId(): string {
  return process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
}

export function getEmbeddingDimensions(): number {
  const value = Number(process.env.EMBEDDING_DIMENSIONS || 768);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("EMBEDDING_DIMENSIONS must be a positive integer");
  }
  return value;
}

export function chatModel() {
  requireEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  return google(getChatModelId());
}

export function embeddingModel() {
  requireEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  return google.embedding(getEmbeddingModelId());
}
