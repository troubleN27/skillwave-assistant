import { z } from "zod";

export const languageSchema = z.enum(["ru", "en"], {
  error: "Выберите язык документа",
});

const title = z
  .string()
  .trim()
  .min(2, "Название — минимум 2 символа")
  .max(200, "Название — максимум 200 символов");

export const textDocumentSchema = z.object({
  title,
  language: languageSchema,
  content: z
    .string()
    .trim()
    .min(20, "Текст — минимум 20 символов")
    .max(200_000, "Текст слишком длинный: максимум 200 000 символов"),
});
export type TextDocumentInput = z.infer<typeof textDocumentSchema>;

export const faqDocumentSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Вопрос — минимум 5 символов")
    .max(300, "Вопрос — максимум 300 символов"),
  answer: z
    .string()
    .trim()
    .min(5, "Ответ — минимум 5 символов")
    .max(3000, "Ответ — максимум 3000 символов"),
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
      "Файл должен быть загружен в хранилище",
    ),
});
export type FileDocumentInput = z.infer<typeof fileDocumentSchema>;

export const documentIdSchema = z.uuid("Некорректный идентификатор документа");

export const renameDocumentSchema = z.object({ title, language: languageSchema });

export const searchTestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Введите вопрос")
    .max(1000, "Вопрос — максимум 1000 символов"),
});

/** Splits FAQ content stored as "Вопрос: … Ответ: …" back into fields. */
export function parseFaqContent(content: string): { question: string; answer: string } {
  const match = /^Вопрос:\s*([\s\S]*?)\nОтвет:\s*([\s\S]*)$/.exec(content.trim());
  return match
    ? { question: match[1].trim(), answer: match[2].trim() }
    : { question: "", answer: content.trim() };
}
