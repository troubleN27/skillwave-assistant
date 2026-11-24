export type KnowledgeDocument = {
  id: string;
  title: string;
  sourceType: "pdf" | "docx" | "txt" | "md" | "text" | "faq";
  language: "ru" | "en";
  content: string;
  status: "processing" | "ready" | "error";
  error: string | null;
  chunkCount: number;
  updatedAt: Date;
};

export const SOURCE_TYPE_LABELS: Record<KnowledgeDocument["sourceType"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  md: "Markdown",
  text: "Текст",
  faq: "FAQ",
};

export const LANGUAGE_LABELS: Record<KnowledgeDocument["language"], string> = {
  ru: "Русский",
  en: "English",
};
