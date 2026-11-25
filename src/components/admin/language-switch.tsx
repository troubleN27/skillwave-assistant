"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setAdminLanguage } from "@/lib/admin/language-action";
import { ADMIN_LANGS } from "@/lib/admin/locale";
import { cn } from "@/lib/utils";

const TONES = {
  /** On the black sidebar. */
  dark: { box: "border-sun text-sun", active: "bg-sun text-ink", idle: "hover:bg-sun/15", focus: "focus-visible:outline-sun" },
  /** On light pages (login). */
  light: { box: "border-ink text-ink", active: "bg-ink text-sun", idle: "hover:bg-ink/10", focus: "focus-visible:outline-ink" },
};

/**
 * RU / EN switch for the admin interface. The language lives in a cookie and
 * changes the page tree the proxy serves, so the page is reloaded in full.
 */
export function LanguageSwitch({ tone = "dark", className }: { tone?: keyof typeof TONES; className?: string }) {
  const t = useTranslations("Admin.common");
  const current = useLocale();
  const [pending, startTransition] = useTransition();
  const style = TONES[tone];

  return (
    <div role="group" aria-label={t("language")} className={cn("flex w-fit border-2 text-xs", style.box, className)}>
      {ADMIN_LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          disabled={pending}
          aria-pressed={lang === current}
          onClick={() =>
            startTransition(async () => {
              if (lang === current) return;
              await setAdminLanguage(lang);
              window.location.reload();
            })
          }
          className={cn(
            "px-2.5 py-1 font-display font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
            style.focus,
            lang === current ? style.active : style.idle,
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
