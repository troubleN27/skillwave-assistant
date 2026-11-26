"use client";

import { FileTextIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

export type Reply = {
  from: "user" | "assistant";
  content: ReactNode;
  sources?: string[];
};

const TYPING_MS = 1100;
const PAUSE_MS = 700;

/**
 * A short conversation with the assistant, pasted on the page as speech
 * bubbles. It plays out — question, "typing…", answer — the first time it
 * scrolls into view. Without JavaScript or with reduced motion every reply
 * is simply there.
 */
export function ChatReplies({
  replies,
  labels,
}: {
  replies: Reply[];
  labels: {
    conversation: string;
    you: string;
    assistant: string;
    typing: string;
  };
}) {
  const [shown, setShown] = useState(replies.length);
  const [typing, setTyping] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timers: number[] = [];
    let started = false;

    const play = () => {
      let at = 200;
      replies.forEach((reply, i) => {
        if (reply.from === "assistant") {
          timers.push(window.setTimeout(() => setTyping(true), at));
          at += TYPING_MS;
        }
        timers.push(
          window.setTimeout(() => {
            setTyping(false);
            setShown(i + 1);
          }, at),
        );
        at += PAUSE_MS;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (started) return;
        if (entry.isIntersecting) {
          started = true;
          observer.disconnect();
          setShown(0);
          play();
        } else {
          // Off screen on load: hide the replies so they can play out later.
          setShown(0);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [replies]);

  // Every reply keeps its place from the start, so the block never changes
  // height (and never shifts) while the conversation plays out. Replies not
  // reached yet are invisible; the one being "typed" shows the dots in its place.
  return (
    <div
      ref={root}
      role="group"
      aria-label={labels.conversation}
      className="grid content-start gap-4"
    >
      {replies.map((reply, i) => {
        const state =
          i < shown ? "shown" : typing && i === shown ? "typing" : "hidden";
        return <Bubble key={i} reply={reply} labels={labels} state={state} />;
      })}
    </div>
  );
}

function Who({
  from,
  labels,
}: {
  from: Reply["from"];
  labels: { you: string; assistant: string };
}) {
  return (
    <p
      className={cn(
        "mb-1 flex items-center gap-1.5 text-xs font-extrabold",
        from === "user" && "self-end",
      )}
    >
      {from === "assistant" && <LogoMark className="size-6" />}
      {from === "user" ? labels.you : labels.assistant}
    </p>
  );
}

function Bubble({
  reply,
  labels,
  state,
}: {
  reply: Reply;
  labels: { you: string; assistant: string; typing: string };
  state: "shown" | "typing" | "hidden";
}) {
  const user = reply.from === "user";
  return (
    <div
      className={cn(
        "relative flex flex-col",
        user ? "items-end" : "items-start",
      )}
    >
      {state === "typing" && (
        <div className="absolute top-0 left-0 flex flex-col items-start motion-safe:animate-in motion-safe:fade-in">
          <Who from="assistant" labels={labels} />
          <div className="-rotate-1 border-[3px] border-ink bg-white px-4 py-3 shadow-[6px_6px_0_var(--color-ink)]">
            <span className="sr-only">{labels.typing}</span>
            <span className="flex gap-1" aria-hidden>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-ink"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex w-full flex-col",
          user ? "items-end" : "items-start",
          state === "shown"
            ? "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
            : "invisible",
        )}
      >
        <Who from={reply.from} labels={labels} />
        <div
          className={cn(
            "max-w-[88%] border-[3px] border-ink px-4 py-2.5 text-[15px] leading-relaxed shadow-[6px_6px_0_var(--color-ink)]",
            user
              ? "rotate-[1.5deg] bg-ink font-semibold text-sun"
              : "-rotate-1 bg-white text-ink",
          )}
        >
          {reply.content}
          {reply.sources && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {reply.sources.map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center gap-1 border border-ink/30 bg-white px-2 py-0.5 text-[11px] text-ink-soft"
                >
                  <FileTextIcon
                    className="size-3 shrink-0 text-ink"
                    aria-hidden
                  />
                  {source}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
