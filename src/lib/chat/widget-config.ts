import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import type { Language } from "@/lib/language";
import { getSettings } from "@/lib/settings";

export const SETTINGS_CACHE_TAG = "settings";

export type WidgetConfig = {
  locale: Language;
  assistantName: string;
  welcome: string | null;
  quickQuestions: string[];
  courses: { id: string; name: string }[];
};

/** Public widget settings for one language. Invalidated by tag when settings change. */
export async function getWidgetConfig(locale: Language): Promise<WidgetConfig> {
  "use cache";
  cacheTag(SETTINGS_CACHE_TAG);
  cacheLife("hours");

  const settings = await getSettings(db);
  const isRu = locale === "ru";
  return {
    locale,
    assistantName: settings.assistantName,
    welcome: (isRu ? settings.welcomeRu : settings.welcomeEn) ?? null,
    quickQuestions: ((isRu ? settings.quickQuestionsRu : settings.quickQuestionsEn) ?? []).slice(0, 4),
    courses: (settings.courses ?? []).map((c) => ({ id: c.id, name: isRu ? c.name_ru : c.name_en })),
  };
}
