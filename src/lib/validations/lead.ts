import { z } from "zod";
import { visitorIdSchema } from "./chat";

/** International phone: leading +, 8–15 digits, spaces/brackets/dashes allowed. */
export function isInternationalPhone(value: string): boolean {
  if (!/^\+[\d\s()-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && digits[0] !== "0";
}

export function isEmail(value: string): boolean {
  return z.email().safeParse(value).success;
}

export const PREFERRED_CHANNELS = ["call", "telegram", "email"] as const;

/** Error messages are i18n keys of the `LeadForm.errors` namespace. */
export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "nameShort").max(60, "nameLong"),
  contact: z
    .string()
    .trim()
    .min(1, "contactRequired")
    .max(100, "contactInvalid")
    .refine((v) => isInternationalPhone(v) || isEmail(v), "contactInvalid"),
  courseId: z.string().max(50).optional().or(z.literal("")),
  preferredChannel: z.enum(PREFERRED_CHANNELS),
  comment: z.string().trim().max(1000, "commentLong").optional().or(z.literal("")),
  consent: z.literal(true, { error: "consentRequired" }),
});
export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const leadRequestSchema = leadFormSchema.extend({
  visitorId: visitorIdSchema,
  conversationId: z.uuid().optional(),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(200).optional(),
});
export type LeadRequest = z.infer<typeof leadRequestSchema>;
