import { adminIntlLocale, type AdminLang } from "@/lib/admin/locale";
import { ADMIN_TIME_ZONE } from "@/lib/admin/period";

const dateTimeFormats = new Map<AdminLang, Intl.DateTimeFormat>();

/** Date and time in Moscow time, e.g. "25.11.2026, 14:05" / "25/11/2026, 14:05". */
export function formatDateTime(date: Date | string, lang: AdminLang): string {
  let format = dateTimeFormats.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(adminIntlLocale(lang), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: ADMIN_TIME_ZONE,
    });
    dateTimeFormats.set(lang, format);
  }
  return format.format(new Date(date));
}

/** The URL if it is http(s), otherwise null — never render other schemes as links. */
export function safeHttpUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

/** Path of a page URL without the origin, for compact tables. */
export function shortPageUrl(url: string | null): string {
  if (!url) return "—";
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return url;
  }
}

/** Lead statuses in workflow order; labels live in Admin.leadStatus. */
export const LEAD_STATUSES = ["new", "in_progress", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
