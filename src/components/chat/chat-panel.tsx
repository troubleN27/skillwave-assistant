"use client";

import { Loader2Icon, PhoneIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { getConversationId, getVisitorId, startNewConversation } from "@/lib/chat/storage";
import type { ChatUIMessage } from "@/lib/chat/types";
import type { WidgetConfig } from "@/lib/chat/widget-config";
import { LogoMark } from "@/components/brand/logo-mark";
import { ChatSession } from "./chat-session";

type SessionState = {
  visitorId: string;
  conversationId: string;
  messages: ChatUIMessage[];
};

async function loadHistory(conversationId: string, visitorId: string): Promise<ChatUIMessage[]> {
  try {
    const params = new URLSearchParams({ id: conversationId, visitorId });
    const res = await fetch(`/api/chat/history?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { messages?: ChatUIMessage[] };
    return data.messages ?? [];
  } catch {
    return [];
  }
}

/** Chat window contents: header, conversation and composer. */
export function ChatPanel({
  config,
  onClose,
  pageUrl,
  pendingQuestion,
  onPendingQuestionSent,
  titleId,
}: {
  config: WidgetConfig;
  onClose: () => void;
  pageUrl: () => string | undefined;
  pendingQuestion: string | null;
  onPendingQuestionSent: () => void;
  titleId: string;
}) {
  const t = useTranslations("Widget");
  const [session, setSession] = useState<SessionState | null>(null);
  const [manualLeadForm, setManualLeadForm] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const restartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    const visitorId = getVisitorId();
    const conversationId = getConversationId();
    loadHistory(conversationId, visitorId).then((messages) => {
      if (!cancelled) setSession({ visitorId, conversationId, messages });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const restart = useCallback(() => {
    setConfirmRestart(false);
    setManualLeadForm(false);
    setSession((prev) =>
      prev ? { ...prev, conversationId: startNewConversation(), messages: [] } : prev,
    );
    requestAnimationFrame(() =>
      document.querySelector<HTMLTextAreaElement>("[data-chat-input]")?.focus(),
    );
  }, []);

  return (
    <div className="flex h-full flex-col bg-paper text-ink">
      <header className="flex items-center gap-3 bg-ink px-4 py-3 text-sun">
        <LogoMark inverted className="-my-1 size-12" />
        <div className="min-w-0 flex-1">
          <p id={titleId} className="truncate font-display text-base font-black">
            {config.assistantName}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-sun/75">
            <span className="size-1.5 rounded-full bg-sun" aria-hidden />
            {t("online")}
          </p>
        </div>
        <button
          ref={restartRef}
          type="button"
          onClick={() => setConfirmRestart(true)}
          aria-label={t("restart")}
          title={t("restart")}
          className="grid size-9 place-items-center text-sun/80 hover:bg-sun/15 hover:text-sun focus-visible:outline-2 focus-visible:outline-sun"
        >
          <RotateCcwIcon className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-9 place-items-center text-sun/80 hover:bg-sun/15 hover:text-sun focus-visible:outline-2 focus-visible:outline-sun"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </header>
      <div className="border-b-2 border-ink bg-sun px-4 py-1.5">
        <button
          type="button"
          onClick={() => setManualLeadForm(true)}
          className="inline-flex items-center gap-1.5 py-0.5 text-xs font-bold text-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
        >
          <PhoneIcon className="size-3.5" aria-hidden />
          {t("contactManager")}
        </button>
      </div>

      {confirmRestart && (
        <div role="alertdialog" aria-label={t("restart")} className="border-b-2 border-ink bg-sun px-4 py-3 text-sm text-ink">
          <p>{t("restartConfirm")}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              autoFocus
              onClick={restart}
              className="bg-ink px-3 py-1.5 text-xs font-bold text-sun hover:bg-ink-soft"
            >
              {t("restartYes")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmRestart(false);
                restartRef.current?.focus();
              }}
              className="px-3 py-1.5 text-xs font-bold text-ink hover:bg-paper"
            >
              {t("restartNo")}
            </button>
          </div>
        </div>
      )}

      {session ? (
        <ChatSession
          key={session.conversationId}
          conversationId={session.conversationId}
          visitorId={session.visitorId}
          initialMessages={session.messages}
          config={config}
          pageUrl={pageUrl}
          manualLeadForm={manualLeadForm}
          onManualLeadFormClose={() => setManualLeadForm(false)}
          pendingQuestion={pendingQuestion}
          onPendingQuestionSent={onPendingQuestionSent}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-ink-soft" role="status">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          {t("loadingHistory")}
        </div>
      )}
    </div>
  );
}
