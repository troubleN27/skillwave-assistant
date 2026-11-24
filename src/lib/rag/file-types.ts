/** File constants shared by the browser upload UI and server-side extraction. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const FILE_SOURCE_TYPES = ["pdf", "docx", "txt", "md"] as const;
export type FileSourceType = (typeof FILE_SOURCE_TYPES)[number];

export const FILE_CONTENT_TYPES: Record<FileSourceType, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/x-markdown", "text/plain"],
};

export function sourceTypeFromFileName(fileName: string): FileSourceType | null {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "markdown") return "md";
  return (FILE_SOURCE_TYPES as readonly string[]).includes(ext ?? "")
    ? (ext as FileSourceType)
    : null;
}
