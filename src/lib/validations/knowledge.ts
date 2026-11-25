import { z } from "zod";

// Error messages are keys of the Admin.validation namespace.

export const languageSchema = z.enum(["ru", "en"], {
  error: "documentLanguage",
});

const title = z
  .string()
  .trim()
  .min(2, "titleMin")
  .max(200, "titleMax");

export const textDocumentSchema = z.object({
  title,
  language: languageSchema,
  content: z
    .string()
    .trim()
    .min(20, "textMin")
    .max(200_000, "textMax"),
});
export type TextDocumentInput = z.infer<typeof textDocumentSchema>;

export const faqDocumentSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "questionMin")
    .max(300, "questionMax"),
  answer: z
    .string()
    .trim()
    .min(5, "answerMin")
    .max(3000, "answerMax"),
  language: languageSchema,
});
export type FaqDocumentInput = z.infer<typeof faqDocumentSchema>;

export const fileDocumentSchema = z.object({
  title,
  language: languageSchema,
  sourceType: z.enum(["pdf", "docx", "txt", "md"]),
  blobUrl: z
    .url()
    .refine(
      (url) => new URL(url).hostname.endsWith(".blob.vercel-storage.com"),
      "blobStorage",
    ),
});
export type FileDocumentInput = z.infer<typeof fileDocumentSchema>;

export const documentIdSchema = z.uuid("documentId");

export const renameDocumentSchema = z.object({ title, language: languageSchema });

export const searchTestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "searchQuestionRequired")
    .max(1000, "searchQuestionMax"),
});

/** Splits FAQ content stored as "Вопрос: … Ответ: …" back into fields. */
export function parseFaqContent(content: string): { question: string; answer: string } {
  const match = /^Вопрос:\s*([\s\S]*?)\nОтвет:\s*([\s\S]*)$/.exec(content.trim());
  return match
    ? { question: match[1].trim(), answer: match[2].trim() }
    : { question: "", answer: content.trim() };
}
