import { describe, expect, it } from "vitest";
import {
  chunkFaq,
  chunkText,
  formatFaqContent,
  MAX_CHUNK_SIZE,
  overlapTail,
  splitIntoSections,
} from "@/lib/rag/chunking";

const sentence = (i: number) =>
  `Предложение номер ${i} рассказывает о программе курса и практических заданиях.`;

function longParagraphs(count: number, sentencesEach = 4) {
  return Array.from({ length: count }, (_, p) =>
    Array.from({ length: sentencesEach }, (_, s) => sentence(p * 10 + s)).join(" "),
  ).join("\n\n");
}

describe("chunkText", () => {
  it("keeps a short text as one chunk", () => {
    const chunks = chunkText("# Оплата\n\nМожно оплатить картой.");
    expect(chunks).toEqual([
      { position: 0, heading: "Оплата", content: "Можно оплатить картой." },
    ]);
  });

  it("splits a long section into chunks no longer than the maximum", () => {
    const chunks = chunkText(`## Программа\n\n${longParagraphs(12)}`);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
      expect(chunk.heading).toBe("Программа");
    }
    expect(chunks.map((c) => c.position)).toEqual(chunks.map((_, i) => i));
  });

  it("splits a single huge paragraph by sentences", () => {
    const huge = Array.from({ length: 60 }, (_, i) => sentence(i)).join(" ");
    const chunks = chunkText(huge);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
    }
  });

  it("handles text without headings", () => {
    const chunks = chunkText(longParagraphs(6));
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.heading === null)).toBe(true);
  });

  it("adds overlap from the previous chunk within a section", () => {
    const chunks = chunkText(`# Курс\n\n${longParagraphs(8)}`);
    expect(chunks.length).toBeGreaterThan(1);
    const tail = overlapTail(chunks[0].content);
    expect(tail.length).toBeGreaterThan(0);
    expect(tail.length).toBeLessThanOrEqual(150);
    expect(chunks[1].content.startsWith(tail)).toBe(true);
  });

  it("does not carry overlap across sections", () => {
    const text = `# Первый\n\n${longParagraphs(4)}\n\n# Второй\n\nКороткий раздел.`;
    const chunks = chunkText(text);
    const second = chunks.find((c) => c.heading === "Второй");
    expect(second?.content).toBe("Короткий раздел.");
  });

  it("builds nested heading paths", () => {
    const sections = splitIntoSections(
      "# Python-разработчик\n\nВступление.\n\n## Модуль 1\n\nОсновы.\n\n### Урок 1\n\nПеременные.\n\n## Модуль 2\n\nВеб.",
    );
    expect(sections.map((s) => s.heading)).toEqual([
      "Python-разработчик",
      "Python-разработчик › Модуль 1",
      "Python-разработчик › Модуль 1 › Урок 1",
      "Python-разработчик › Модуль 2",
    ]);
  });
});

describe("FAQ", () => {
  it("is always a single chunk", () => {
    const content = formatFaqContent("Есть ли рассрочка?", longParagraphs(5));
    const chunks = chunkFaq(content);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content.startsWith("Вопрос: Есть ли рассрочка?\nОтвет:")).toBe(true);
  });

  it("returns no chunks for empty content", () => {
    expect(chunkFaq("   ")).toEqual([]);
  });
});
