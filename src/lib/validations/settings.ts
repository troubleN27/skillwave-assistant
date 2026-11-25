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

const quickQuestions = z
  .string()
  .transform(toLines)
  .pipe(
    z
      .array(z.string().max(120, "Быстрый вопрос — максимум 120 символов"))
      .max(4, "Не больше 4 быстрых вопросов"),
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
    .regex(/^[a-z0-9-]{2,40}$/, "Код курса: латиница в нижнем регистре, цифры и дефис, 2–40 символов"),
  name_ru: z.string().trim().min(2, "Название на русском — минимум 2 символа").max(80),
  name_en: z.string().trim().min(2, "Название на английском — минимум 2 символа").max(80),
});

export const settingsSchema = z.object({
  assistantName: z.string().trim().min(2, "Имя — минимум 2 символа").max(60, "Имя — максимум 60 символов"),
  welcomeRu: optionalText(500, "Приветствие — максимум 500 символов"),
  welcomeEn: optionalText(500, "Приветствие — максимум 500 символов"),
  quickQuestionsRu: quickQuestions,
  quickQuestionsEn: quickQuestions,
  contactsRu: optionalText(1000, "Контакты — максимум 1000 символов"),
  contactsEn: optionalText(1000, "Контакты — максимум 1000 символов"),
  courses: z
    .array(courseSchema)
    .max(20, "Не больше 20 курсов")
    .refine((list) => new Set(list.map((c) => c.id)).size === list.length, "Коды курсов не должны повторяться"),
  allowedOrigins: z
    .string()
    .transform(toLines)
    .pipe(
      z
        .array(z.string())
        .max(20, "Не больше 20 сайтов")
        .refine((list) => list.every((v) => toOrigin(v) !== null), "Укажите адреса сайтов, например https://partner.ru")
        .transform((list) => [...new Set(list.map((v) => toOrigin(v)!))]),
    ),
  maxMessagesPerConversation: z.coerce
    .number<string | number>()
    .int("Целое число")
    .min(5, "Не меньше 5")
    .max(200, "Не больше 200"),
  maxMessagesPerDay: z.coerce
    .number<string | number>()
    .int("Целое число")
    .min(10, "Не меньше 10")
    .max(100_000, "Не больше 100 000"),
  minSimilarity: z.coerce
    .number<string | number>()
    .min(0.3, "Не меньше 0.3")
    .max(0.95, "Не больше 0.95"),
  telegramNotifications: z.boolean(),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
export type SettingsValues = z.output<typeof settingsSchema>;
