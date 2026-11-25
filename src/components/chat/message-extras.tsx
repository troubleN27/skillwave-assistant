"use client";

import { FileTextIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ChatSource } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

export function Sources({ sources }: { sources: ChatSource[] }) {
  const t = useTranslations("Widget");
  if (sources.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label={t("sources")}>
      {sources.map((source) => (
        <span
          key={source.documentId}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-indigo-100 bg-white px-2 py-0.5 text-[11px] text-slate-600"
          title={source.title}
        >
          <FileTextIcon className="size-3 shrink-0 text-cyan-600" aria-hidden />
          <span className="truncate">{source.title}</span>
        </span>
      ))}
    </div>
  );
}

export function Feedback({
  messageId,
  visitorId,
  initial,
}: {
  messageId: string;
  visitorId: string;
  initial?: "up" | "down" | null;
}) {
  const t = useTranslations("Widget");
  const [value, setValue] = useState<"up" | "down" | null>(initial ?? null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function rate(next: "up" | "down") {
    if (next === value) return;
    const previous = value;
    setValue(next);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId, visitorId, value: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("saved");
    } catch {
      setValue(previous);
      setStatus("error");
    }
  }

  const button = (kind: "up" | "down") => {
    const Icon = kind === "up" ? ThumbsUpIcon : ThumbsDownIcon;
    const active = value === kind;
    return (
      <button
        type="button"
        onClick={() => rate(kind)}
        aria-label={t(kind === "up" ? "helpful" : "notHelpful")}
        aria-pressed={active}
        className={cn(
          "rounded-full p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500",
          active && "bg-indigo-50 text-indigo-600",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </button>
    );
  };

  return (
    <div className="mt-1 flex items-center gap-0.5">
      {button("up")}
      {button("down")}
      <span className="ml-1 text-[11px] text-slate-400" role="status">
        {status === "saved" ? t("feedbackThanks") : status === "error" ? t("feedbackError") : ""}
      </span>
    </div>
  );
}
