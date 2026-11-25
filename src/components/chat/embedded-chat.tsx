"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useId } from "react";
import type { WidgetConfig } from "@/lib/chat/widget-config";
import { EMBED_MESSAGE } from "@/lib/embed";
import { ChatPanel } from "./chat-panel";

// The host page, not the iframe URL, is the page the visitor is on.
const hostPageUrl = () => document.referrer || undefined;

/** Chat panel rendered inside the iframe; the launcher lives in widget.js on the host page. */
export function EmbeddedChat({ config }: { config: WidgetConfig }) {
  const titleId = useId();
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const close = useCallback(() => {
    // "*" is safe: the message carries no data, and the parent checks our origin.
    window.parent.postMessage({ type: EMBED_MESSAGE.close }, "*");
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if ((event.data as { type?: string } | null)?.type === EMBED_MESSAGE.open) {
        document.querySelector<HTMLTextAreaElement>("[data-chat-input]")?.focus();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <div role="dialog" aria-labelledby={titleId} className="h-svh">
      <ChatPanel
        config={config}
        onClose={close}
        pageUrl={hostPageUrl}
        pendingQuestion={null}
        onPendingQuestionSent={noop}
        titleId={titleId}
      />
    </div>
  );
}

function noop() {}
