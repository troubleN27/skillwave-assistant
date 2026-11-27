import { z } from "zod";

/** Splits a textarea value into trimmed non-empty lines. */
export function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "https://partner.ru/page" → "https://partner.ru"; null for anything that isn't http(s). */
export function toOrigin(value: string): string | null {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

// Error messages are keys of the Admin.validation namespace.

const quickQuestions = z
  .string()
  .transform(toLines)
  .pipe(
    z
      .array(z.string().max(120, "quickQuestionMax"))
      .max(4, "quickQuestionsCount"),
  );

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => v || null);

export const courseSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,40}$/, "courseCode"),
  name_ru: z.string().trim().min(2, "courseNameRu").max(80, "courseNameMax"),
  name_en: z.string().trim().min(2, "courseNameEn").max(80, "courseNameMax"),
});

const assistantName = z.string().trim().min(2, "assistantNameMin").max(60, "assistantNameMax");

export const settingsSchema = z.object({
  assistantNameRu: assistantName,
  assistantNameEn: assistantName,
  welcomeRu: optionalText(500, "welcomeMax"),
  welcomeEn: optionalText(500, "welcomeMax"),
  quickQuestionsRu: quickQuestions,
  quickQuestionsEn: quickQuestions,
  contactsRu: optionalText(1000, "contactsMax"),
  contactsEn: optionalText(1000, "contactsMax"),
  courses: z
    .array(courseSchema)
    .max(20, "coursesMax")
    .refine((list) => new Set(list.map((c) => c.id)).size === list.length, "courseCodesUnique"),
  allowedOrigins: z
    .string()
    .transform(toLines)
    .pipe(
      z
        .array(z.string())
        .max(20, "originsMax")
        .refine((list) => list.every((v) => toOrigin(v) !== null), "originsInvalid")
        .transform((list) => [...new Set(list.map((v) => toOrigin(v)!))]),
    ),
  maxMessagesPerConversation: z.coerce
    .number<string | number>()
    .int("integer")
    .min(5, "conversationLimitRange")
    .max(200, "conversationLimitRange"),
  maxMessagesPerDay: z.coerce
    .number<string | number>()
    .int("integer")
    .min(10, "dailyLimitRange")
    .max(100_000, "dailyLimitRange"),
  minSimilarity: z.coerce
    .number<string | number>()
    .min(0.3, "similarityRange")
    .max(0.95, "similarityRange"),
  telegramNotifications: z.boolean(),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
export type SettingsValues = z.output<typeof settingsSchema>;
