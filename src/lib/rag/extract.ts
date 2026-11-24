import mammoth from "mammoth";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

import { MAX_FILE_SIZE, type FileSourceType } from "./file-types";

export class ExtractionError extends Error {}

export const SCANNED_DOCUMENT_MESSAGE =
  "Не удалось извлечь текст: возможно, это скан";

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Converts mammoth's simple HTML to Markdown, keeping headings and lists. */
export function htmlToMarkdown(html: string): string {
  const stripTags = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, "")).trim();

  return html
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, inner: string) => {
      const depth = Math.min(Number(level), 3);
      return `\n\n${"#".repeat(depth)} ${stripTags(inner)}\n\n`;
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner: string) => `\n- ${stripTags(inner)}`)
    .replace(/<\/(ul|ol)>/gi, "\n\n")
    .replace(/<(p|tr)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag: string, inner: string) => `\n\n${stripTags(inner)}\n\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => decodeEntities(line).trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeText(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

/** Extracts plain text (Markdown for DOCX) from an uploaded file (SPEC 4.1). */
export async function extractTextFromFile(
  data: ArrayBuffer,
  sourceType: FileSourceType,
): Promise<string> {
  if (data.byteLength > MAX_FILE_SIZE) {
    throw new ExtractionError("Файл больше 10 МБ");
  }

  let text: string;
  try {
    switch (sourceType) {
      case "pdf": {
        const pdf = await getDocumentProxy(new Uint8Array(data));
        const result = await extractPdfText(pdf, { mergePages: false });
        text = result.text.join("\n\n");
        break;
      }
      case "docx": {
        const { value } = await mammoth.convertToHtml({ buffer: Buffer.from(data) });
        text = htmlToMarkdown(value);
        break;
      }
      case "txt":
      case "md":
        text = new TextDecoder("utf-8").decode(data);
        break;
    }
  } catch (error) {
    throw new ExtractionError(
      `Не удалось прочитать файл: ${error instanceof Error ? error.message : "неизвестная ошибка"}`,
    );
  }

  const normalized = normalizeText(text);
  if (!normalized) throw new ExtractionError(SCANNED_DOCUMENT_MESSAGE);
  return normalized;
}
