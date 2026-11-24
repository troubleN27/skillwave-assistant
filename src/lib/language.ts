export type Language = "ru" | "en";

/**
 * Detects the reply language from the visitor's text: Cyrillic → ru,
 * Latin → en (whichever script dominates), otherwise the fallback.
 */
export function detectLanguage(text: string, fallback: Language): Language {
  const cyrillic = (text.match(/[а-яё]/gi) ?? []).length;
  const latin = (text.match(/[a-z]/gi) ?? []).length;
  if (cyrillic === 0 && latin === 0) return fallback;
  return cyrillic >= latin ? "ru" : "en";
}
