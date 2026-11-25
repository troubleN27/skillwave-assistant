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

const FILE_TYPE_LABELS: Record<Exclude<KnowledgeDocument["sourceType"], "text">, string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  md: "Markdown",
  faq: "FAQ",
};

/** Format names are the same in every language; only "text" is translated. */
export const sourceTypeLabel = (type: KnowledgeDocument["sourceType"], textLabel: string) =>
  type === "text" ? textLabel : FILE_TYPE_LABELS[type];

export const DOCUMENT_LANGUAGES = ["ru", "en"] as const satisfies readonly KnowledgeDocument["language"][];
