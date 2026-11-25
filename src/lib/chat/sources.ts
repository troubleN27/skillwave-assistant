import type { Language } from "@/lib/language";
import type { ChatSource } from "./types";

type SourceCandidate = { documentId: string; title: string; language?: Language };

/**
 * Sources shown under an answer: one entry per document, and only documents
 * in the reply language when there are any. The knowledge base keeps RU and EN
 * twins of the same document, so without this filter both titles would show.
 * Sources stored before languages were recorded have no `language` and are all kept.
 */
export function visibleSources(items: SourceCandidate[], replyLanguage: Language): ChatSource[] {
  const unique = new Map<string, SourceCandidate>();
  for (const item of items) {
    if (!unique.has(item.documentId)) unique.set(item.documentId, item);
  }
  const all = [...unique.values()];
  const sameLanguage = all.filter((s) => s.language === replyLanguage);
  return (sameLanguage.length ? sameLanguage : all).map(({ documentId, title }) => ({
    documentId,
    title,
  }));
}
