"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ChatOpenState = {
  open: boolean;
  /** Question to send as soon as the chat opens (e.g. from a course card). */
  pendingQuestion: string | null;
  openChat: (question?: string) => void;
  closeChat: () => void;
  takePendingQuestion: () => string | null;
};

const ChatOpenContext = createContext<ChatOpenState | null>(null);

export function ChatOpenProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const openChat = useCallback((question?: string) => {
    if (question) setPendingQuestion(question);
    setOpen(true);
  }, []);
  const closeChat = useCallback(() => setOpen(false), []);
  const takePendingQuestion = useCallback(() => {
    const question = pendingQuestion;
    if (question) setPendingQuestion(null);
    return question;
  }, [pendingQuestion]);

  const value = useMemo(
    () => ({ open, pendingQuestion, openChat, closeChat, takePendingQuestion }),
    [open, pendingQuestion, openChat, closeChat, takePendingQuestion],
  );
  return <ChatOpenContext.Provider value={value}>{children}</ChatOpenContext.Provider>;
}

export function useChatOpen(): ChatOpenState {
  const context = useContext(ChatOpenContext);
  if (!context) throw new Error("useChatOpen must be used within ChatOpenProvider");
  return context;
}
