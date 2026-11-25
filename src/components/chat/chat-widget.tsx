"use client";

import { MessageCircleIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { WidgetConfig } from "@/lib/chat/widget-config";
import { cn } from "@/lib/utils";
import { useChatOpen } from "./chat-context";
import { ChatPanel } from "./chat-panel";

const currentPageUrl = () => window.location.href;

/** Floating launcher + chat window for the school website (SPEC 6.1, 6.4). */
export function ChatWidget({ config }: { config: WidgetConfig }) {
  const t = useTranslations("Widget");
  const { open, openChat, closeChat, pendingQuestion, takePendingQuestion } = useChatOpen();
  const [mounted, setMounted] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Mount the panel on first open and keep it mounted to preserve the conversation.
  if (open && !mounted) setMounted(true);

  // Return focus to the launcher once it is visible again (it is hidden on phones while open).
  const close = useCallback(() => {
    closeChat();
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, [closeChat]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(
      () => document.querySelector<HTMLTextAreaElement>("[data-chat-input]")?.focus(),
      50,
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open, close, mounted]);

  return (
    <>
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        className={cn(
          "fixed inset-0 z-50 flex flex-col overflow-hidden bg-paper",
          "sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(600px,calc(100svh-8rem))] sm:w-[380px] sm:border-2 sm:border-ink sm:shadow-[8px_8px_0_var(--color-ink)]",
          "motion-safe:origin-bottom-right motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
        )}
      >
        {mounted && (
          <ChatPanel
            config={config}
            onClose={close}
            pageUrl={currentPageUrl}
            pendingQuestion={open ? pendingQuestion : null}
            onPendingQuestionSent={takePendingQuestion}
            titleId={titleId}
          />
        )}
      </div>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : openChat())}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        className={cn(
          "fixed right-4 bottom-4 z-50 grid size-14 place-items-center border-2 border-sun bg-ink text-sun shadow-[4px_4px_0_rgba(18,17,16,0.3)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:right-6 sm:bottom-6",
          open && "max-sm:hidden",
        )}
      >
        {open ? <XIcon className="size-6" aria-hidden /> : <MessageCircleIcon className="size-6" aria-hidden />}
      </button>
    </>
  );
}
