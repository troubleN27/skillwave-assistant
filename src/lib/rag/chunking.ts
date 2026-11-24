export const TARGET_CHUNK_SIZE = 800;
export const MAX_CHUNK_SIZE = 1200;
export const CHUNK_OVERLAP = 150;

export type Chunk = {
  position: number;
  heading: string | null;
  content: string;
};

type Section = { heading: string | null; body: string };

const HEADING_RE = /^(#{1,3})\s+(.+?)\s*#*\s*$/;

/**
 * Splits Markdown into sections by `#`, `##`, `###`. A section heading is the
 * path of enclosing headings, e.g. "Python-разработчик › Модуль 2".
 */
export function splitIntoSections(text: string): Section[] {
  const sections: Section[] = [];
  const path: string[] = [];
  let current: string[] = [];
  let heading: string | null = null;

  const flush = () => {
    const body = current.join("\n").trim();
    if (body) sections.push({ heading, body });
    current = [];
  };

  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const match = HEADING_RE.exec(line);
    if (!match) {
      current.push(line);
      continue;
    }
    flush();
    const level = match[1].length;
    path.length = level - 1;
    path[level - 1] = match[2].trim();
    heading = path.filter(Boolean).join(" › ");
  }
  flush();
  return sections;
}

function splitIntoSentences(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?…]+(?:[.!?…]+["»)]?|$)\s*/g) ?? [paragraph];
  return sentences.map((s) => s.trim()).filter(Boolean);
}

/** Breaks text that is longer than `max` into pieces by sentences, then by words. */
function splitLongText(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const pieces: string[] = [];
  let current = "";

  const push = (piece: string) => {
    if (piece) pieces.push(piece);
  };

  for (const sentence of splitIntoSentences(text)) {
    if (sentence.length > max) {
      push(current);
      current = "";
      for (const word of sentence.split(/\s+/)) {
        if (current && current.length + word.length + 1 > max) {
          push(current);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
      continue;
    }
    if (current && current.length + sentence.length + 1 > max) {
      push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  push(current);
  return pieces;
}

/** Last ~`size` characters of a chunk, starting at a sentence or word boundary. */
export function overlapTail(text: string, size = CHUNK_OVERLAP): string {
  if (text.length <= size) return text;
  const tail = text.slice(-size);
  const sentenceStart = tail.search(/[.!?…]\s+\S/);
  if (sentenceStart !== -1) {
    return tail.slice(sentenceStart + 1).trim();
  }
  const space = tail.indexOf(" ");
  return (space === -1 ? tail : tail.slice(space + 1)).trim();
}

function chunkSection(body: string): string[] {
  // Leave room for the overlap prefix so chunks never exceed MAX_CHUNK_SIZE.
  const pieceLimit = MAX_CHUNK_SIZE - CHUNK_OVERLAP - 2;
  const units = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => splitLongText(p, pieceLimit));

  const groups: string[] = [];
  let current = "";
  for (const unit of units) {
    const candidate = current ? `${current}\n\n${unit}` : unit;
    if (current && candidate.length > TARGET_CHUNK_SIZE) {
      groups.push(current);
      current = unit;
    } else {
      current = candidate;
    }
  }
  if (current) groups.push(current);

  return groups.map((group, i) => {
    if (i === 0) return group;
    const withOverlap = `${overlapTail(groups[i - 1])}\n\n${group}`;
    return withOverlap.length <= MAX_CHUNK_SIZE ? withOverlap : group;
  });
}

/** Splits a Markdown/plain-text document into chunks (SPEC 4.2). */
export function chunkText(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  for (const section of splitIntoSections(text)) {
    for (const content of chunkSection(section.body)) {
      chunks.push({ position: chunks.length, heading: section.heading, content });
    }
  }
  return chunks;
}

export function formatFaqContent(question: string, answer: string): string {
  return `Вопрос: ${question.trim()}\nОтвет: ${answer.trim()}`;
}

/** A FAQ entry is always a single chunk. */
export function chunkFaq(content: string): Chunk[] {
  const trimmed = content.trim();
  return trimmed ? [{ position: 0, heading: null, content: trimmed }] : [];
}
