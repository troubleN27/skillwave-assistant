"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DOCUMENT_LANGUAGES, type KnowledgeDocument } from "./types";

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
  const t = useTranslations("Admin.knowledge");
  return (
    <div
      role="radiogroup"
      aria-label={t("documentLanguage")}
      className="inline-flex w-fit border-2 border-ink bg-white p-0.5"
    >
      {DOCUMENT_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          role="radio"
          aria-checked={value === lang}
          disabled={disabled}
          onClick={() => onChange(lang)}
          className={cn(
            "px-3 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:opacity-50",
            value === lang
              ? "bg-ink font-bold text-sun"
              : "text-ink hover:bg-sun",
          )}
        >
          {t(`languages.${lang}`)}
        </button>
      ))}
    </div>
  );
}
