"use client";

import { useEffect } from "react";

const TEXT = {
  ru: { title: "Чат временно недоступен", retry: "Попробовать снова" },
  en: { title: "The chat is temporarily unavailable", retry: "Try again" },
};

/** The chat inside an iframe failed to render: keep it small and recoverable. */
export default function EmbedError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const lang = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "ru";
  const t = TEXT[lang];

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-lg font-black text-ink">{t.title}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="bg-ink px-4 py-2 text-sm font-bold text-sun hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {t.retry}
      </button>
    </div>
  );
}
