import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { settings } from "@/db/schema";

export const DEFAULT_MIN_SIMILARITY = 0.68;

export type AssistantSettings = typeof settings.$inferSelect;

const FALLBACK: AssistantSettings = {
  id: 1,
  assistantName: "Ассистент Skillwave",
  welcomeRu: null,
  welcomeEn: null,
  quickQuestionsRu: [],
  quickQuestionsEn: [],
  contactsRu: null,
  contactsEn: null,
  courses: [],
  allowedOrigins: [],
  maxMessagesPerConversation: 30,
  maxMessagesPerDay: 500,
  minSimilarity: DEFAULT_MIN_SIMILARITY,
  telegramNotifications: true,
};

export async function getSettings(db: Database): Promise<AssistantSettings> {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? FALLBACK;
}

export async function getMinSimilarity(db: Database): Promise<number> {
  return (await getSettings(db)).minSimilarity;
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * The chat may be called from the school website itself (NEXT_PUBLIC_SITE_URL)
 * or from sites listed in `settings.allowed_origins` (SPEC 5.1, step 1).
 */
export function isAllowedOrigin(
  origin: string | null,
  siteUrl: string | undefined,
  allowedOrigins: string[] | null,
): boolean {
  if (!origin) return false;
  const requested = normalizeOrigin(origin);
  if (!requested) return false;
  const allowed = [siteUrl, ...(allowedOrigins ?? [])]
    .filter((v): v is string => Boolean(v))
    .map(normalizeOrigin);
  return allowed.includes(requested);
}
