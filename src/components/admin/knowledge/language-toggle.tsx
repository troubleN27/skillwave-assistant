"use client";

import { cn } from "@/lib/utils";
import { LANGUAGE_LABELS, type KnowledgeDocument } from "./types";

type Language = KnowledgeDocument["language"];

export function LanguageToggle({
  value,
  onChange,
  disabled,
}: {
  value: Language;
  onChange: (value: Language) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Язык документа"
      className="inline-flex w-fit rounded-lg border bg-muted p-0.5"
    >
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
        <button
          key={lang}
          type="button"
          role="radio"
          aria-checked={value === lang}
          disabled={disabled}
          onClick={() => onChange(lang)}
          className={cn(
            "rounded-md px-3 py-1 text-sm transition-colors disabled:opacity-50",
            value === lang
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
