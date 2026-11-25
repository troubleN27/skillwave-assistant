import { ADMIN_TIME_ZONE } from "@/lib/admin/period";

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ADMIN_TIME_ZONE,
});

/** Date and time in Moscow time, e.g. "25.11.2026, 14:05". */
export const formatDateTime = (date: Date | string) => dateTime.format(new Date(date));

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

export const LEAD_STATUS_LABELS = {
  new: "Новая",
  in_progress: "В работе",
  closed: "Закрыта",
} as const;

export const CHANNEL_LABELS = { call: "Звонок", telegram: "Telegram", email: "Email" } as const;
