"use client";

import { Loader2Icon, PhoneIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { getConversationId, getVisitorId, startNewConversation } from "@/lib/chat/storage";
import type { ChatUIMessage } from "@/lib/chat/types";
import type { WidgetConfig } from "@/lib/chat/widget-config";
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
    <div className="flex h-full flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
          aria-hidden
        >
          S
        </div>
        <div className="min-w-0 flex-1">
          <p id={titleId} className="truncate text-sm font-semibold text-slate-900">
            {config.assistantName}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="size-1.5 rounded-full bg-cyan-500" aria-hidden />
            {t("online")}
          </p>
        </div>
        <button
          ref={restartRef}
          type="button"
          onClick={() => setConfirmRestart(true)}
          aria-label={t("restart")}
          title={t("restart")}
          className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <RotateCcwIcon className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </header>
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-1.5">
        <button
          type="button"
          onClick={() => setManualLeadForm(true)}
          className="inline-flex items-center gap-1.5 rounded-full py-0.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <PhoneIcon className="size-3.5" aria-hidden />
          {t("contactManager")}
        </button>
      </div>

      {confirmRestart && (
        <div role="alertdialog" aria-label={t("restart")} className="border-b border-slate-100 bg-indigo-50 px-4 py-3 text-sm text-slate-800">
          <p>{t("restartConfirm")}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              autoFocus
              onClick={restart}
              className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {t("restartYes")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmRestart(false);
                restartRef.current?.focus();
              }}
              className="rounded-full px-3 py-1 text-xs font-medium text-slate-700 hover:bg-white"
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
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-500" role="status">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          {t("loadingHistory")}
        </div>
      )}
    </div>
  );
}
