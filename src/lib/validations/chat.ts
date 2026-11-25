import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 1000;

export const visitorIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{8,64}$/, "Некорректный идентификатор посетителя");

export const chatRequestSchema = z.object({
  id: z.uuid("Некорректный идентификатор диалога"),
  visitorId: visitorIdSchema,
  text: z
    .string()
    .trim()
    .min(1, "Введите сообщение")
    .max(MAX_MESSAGE_LENGTH, `Сообщение длиннее ${MAX_MESSAGE_LENGTH} символов`),
  locale: z.enum(["ru", "en"]).default("ru"),
  // Only http(s): the URL is later rendered as a link in the admin panel.
  pageUrl: z.url({ protocol: /^https?$/ }).max(2000).optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const feedbackRequestSchema = z.object({
  messageId: z.uuid("Некорректный идентификатор сообщения"),
  visitorId: visitorIdSchema,
  value: z.enum(["up", "down"]),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;
