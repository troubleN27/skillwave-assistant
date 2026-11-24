import type { UIMessage } from "ai";

export type ChatSource = { documentId: string; title: string };

export type LeadFormReason = "requested" | "no_context" | "limit" | "error";

/** Custom data parts streamed by /api/chat (consumed by the widget). */
export type ChatDataParts = {
  sources: ChatSource[];
  meta: { messageId: string | null; answered: boolean | null };
  "lead-form": { reason: LeadFormReason; courseId?: string };
};

export type ChatUIMessage = UIMessage<never, ChatDataParts>;
