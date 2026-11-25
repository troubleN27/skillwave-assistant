/** Origins allowed to embed /embed in an iframe: 'self' plus settings.allowed_origins. */
export function buildFrameAncestors(allowedOrigins: string[] | null | undefined): string {
  const origins = new Set<string>();
  for (const value of allowedOrigins ?? []) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") origins.add(url.origin);
    } catch {
      // Ignore malformed entries instead of breaking the header.
    }
  }
  return ["'self'", ...origins].join(" ");
}

export const EMBED_MESSAGE = {
  open: "skillwave:open",
  close: "skillwave:close",
} as const;
