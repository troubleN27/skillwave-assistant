"use client";

import type { ComponentProps } from "react";
import { useChatOpen } from "@/components/chat/chat-context";

/** Any button on the site that opens the assistant, optionally with a question. */
export function AskButton({
  question,
  ...props
}: Omit<ComponentProps<"button">, "onClick" | "type"> & { question?: string }) {
  const { openChat } = useChatOpen();
  return <button type="button" onClick={() => openChat(question)} {...props} />;
}
