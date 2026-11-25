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
      <p className="font-medium text-slate-900">{t.title}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {t.retry}
      </button>
    </div>
  );
}
