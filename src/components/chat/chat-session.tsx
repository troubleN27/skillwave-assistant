"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isDataUIPart, isTextUIPart } from "ai";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatDataParts, ChatUIMessage } from "@/lib/chat/types";
import type { WidgetConfig } from "@/lib/chat/widget-config";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/chat";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./chat-markdown";
import { LeadForm } from "./lead-form";
import { Feedback, Sources } from "./message-extras";

type LeadFormState = { anchorId: string; courseId?: string } | null;

function textOf(message: ChatUIMessage): string {
  return message.parts.filter(isTextUIPart).map((p) => p.text).join("");
}

function dataOf<K extends keyof ChatDataParts>(message: ChatUIMessage, name: K) {
  const part = message.parts.findLast(
    (p) => isDataUIPart(p) && p.type === `data-${name}`,
  ) as { data: ChatDataParts[K] } | undefined;
  return part?.data;
}

/** Reads `{ "error": "..." }` from a failed /api/chat response, if present. */
function serverErrorText(error: Error | undefined): string | null {
  if (!error) return null;
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown };
    return typeof parsed.error === "string" ? parsed.error : null;
  } catch {
    return null;
  }
}

export function ChatSession({
  conversationId,
  visitorId,
  initialMessages,
  config,
  pageUrl,
  manualLeadForm,
  onManualLeadFormClose,
  pendingQuestion,
  onPendingQuestionSent,
}: {
  conversationId: string;
  visitorId: string;
  initialMessages: ChatUIMessage[];
  config: WidgetConfig;
  pageUrl: () => string | undefined;
  manualLeadForm: boolean;
  onManualLeadFormClose: () => void;
  pendingQuestion: string | null;
  onPendingQuestionSent: () => void;
}) {
  const t = useTranslations("Widget");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [dismissedForms, setDismissedForms] = useState<Set<string>>(() => new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatUIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => {
          const last = messages.at(-1);
          return {
            body: {
              id: conversationId,
              visitorId,
              text: last ? textOf(last) : "",
              locale,
              pageUrl: pageUrl(),
            },
          };
        },
      }),
    [conversationId, visitorId, locale, pageUrl],
  );

  const { messages, sendMessage, status, error, regenerate, stop, setMessages } =
    useChat<ChatUIMessage>({ id: conversationId, messages: initialMessages, transport });

  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const waitingForFirstToken =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "assistant" && !textOf(lastMessage));

  // The form requested by the latest answer (tool call, no context, limits, errors),
  // or the one opened with "Contact a manager".
  const requestedForm =
    status === "ready" && lastMessage?.role === "assistant" && !dismissedForms.has(lastMessage.id)
      ? dataOf(lastMessage, "lead-form")
      : undefined;
  const leadForm: LeadFormState = manualLeadForm
    ? { anchorId: "manual" }
    : requestedForm && lastMessage
      ? { anchorId: lastMessage.id, courseId: requestedForm.courseId }
      : null;

  // The panel mounts after history loads, so focus the composer on mount —
  // but not on touch screens, where focus pops up the keyboard over the chat.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  // Keep the newest content in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, leadForm?.anchorId, waitingForFirstToken]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (manualLeadForm) onManualLeadFormClose();
    setInput("");
    void sendMessage({ text: trimmed.slice(0, MAX_MESSAGE_LENGTH) });
  }

  // A question passed from the page (e.g. "Ask about this course").
  useEffect(() => {
    if (pendingQuestion && status === "ready") {
      onPendingQuestionSent();
      void sendMessage({ text: pendingQuestion.slice(0, MAX_MESSAGE_LENGTH) });
    }
  }, [pendingQuestion, status, sendMessage, onPendingQuestionSent]);

  function closeLeadForm() {
    if (leadForm?.anchorId === "manual") {
      onManualLeadFormClose();
    } else if (leadForm) {
      setDismissedForms((prev) => new Set(prev).add(leadForm.anchorId));
    }
  }

  function leadSent(name: string) {
    closeLeadForm();
    setMessages((prev) => [
      ...prev,
      {
        id: `lead-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: t("leadSent", { name }) }],
      },
    ]);
  }

  const errorText =
    serverErrorText(error) ?? (error ? t("errors.generic") : null);
  const showWelcome = messages.length === 0;
  const remaining = MAX_MESSAGE_LENGTH - input.length;

  const leadFormNode = leadForm && (
    <LeadForm
      courses={config.courses}
      defaultCourseId={leadForm.courseId}
      visitorId={visitorId}
      conversationId={conversationId}
      onSent={leadSent}
      onCancel={closeLeadForm}
    />
  );

  return (
    <>
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {showWelcome && (
          <div className="space-y-3">
            <Bubble role="assistant">
              <ChatMarkdown text={config.welcome ?? t("welcomeFallback")} />
            </Bubble>
            {config.quickQuestions.length > 0 && (
              <div aria-label={t("quickQuestions")} className="flex flex-col items-start gap-1.5">
                {config.quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => send(question)}
                    className="border-2 border-ink bg-white px-3 py-1.5 text-left text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-sun focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message) => {
          const text = textOf(message);
          if (message.role === "user") {
            return (
              <Bubble key={message.id} role="user">
                <p className="whitespace-pre-wrap">{text}</p>
              </Bubble>
            );
          }
          if (!text) return null;
          const sources = dataOf(message, "sources") ?? [];
          const meta = dataOf(message, "meta");
          const streamingThis = busy && message.id === lastMessage?.id;
          return (
            <div key={message.id}>
              <Bubble role="assistant">
                <ChatMarkdown text={text} />
              </Bubble>
              {!streamingThis && (
                <div className="pl-1">
                  {meta?.answered && <Sources sources={sources} />}
                  {meta?.messageId && meta.answered && (
                    <Feedback
                      messageId={meta.messageId}
                      visitorId={visitorId}
                      initial={meta.feedback}
                    />
                  )}
                </div>
              )}
              {leadForm?.anchorId === message.id && leadFormNode}
            </div>
          );
        })}

        {waitingForFirstToken && (
          <div className="flex items-center gap-2 pl-1 text-xs text-ink-soft" role="status">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-ink motion-safe:animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
            {t("typing")}
          </div>
        )}

        {errorText && status === "error" && (
          <div role="alert" className="border-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800">
            <p>{errorText}</p>
            <button
              type="button"
              onClick={() => void regenerate()}
              className="mt-1 font-medium underline underline-offset-2"
            >
              {t("errors.retry")}
            </button>
          </div>
        )}

        {leadForm?.anchorId === "manual" && leadFormNode}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="border-t-2 border-ink bg-paper px-3 pt-3 pb-2"
      >
        <div className="flex items-end gap-2 border-2 border-ink bg-white px-3 py-2 transition-shadow focus-within:shadow-[3px_3px_0_var(--color-ink)]">
          <textarea
            ref={inputRef}
            data-chat-input
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-base text-ink sm:text-sm outline-none [field-sizing:content] placeholder:text-ink-soft/70"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => void stop()}
              aria-label={t("stop")}
              className="grid size-8 shrink-0 place-items-center bg-ink text-sun"
            >
              <SquareIcon className="size-3 fill-current" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={t("send")}
              className="grid size-8 shrink-0 place-items-center bg-ink text-sun transition-colors hover:bg-ink-soft disabled:bg-ink/25 disabled:text-paper"
            >
              <ArrowUpIcon className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-1.5 min-h-4 px-1 text-[10px] leading-4 text-ink-soft">
          {remaining <= 100 ? t("charsLeft", { count: remaining }) : t("disclaimer")}
        </p>
      </form>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-3.5 py-2 text-sm leading-relaxed break-words",
          role === "user" ? "bg-ink text-sun" : "border-2 border-ink bg-white text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}
