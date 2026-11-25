/** Admin reports use Moscow time: the school and its managers work in it (UTC+3, no DST). */
export const ADMIN_TIME_ZONE = "Europe/Moscow";
const MOSCOW_OFFSET = "+03:00";

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];
export const DEFAULT_PERIOD: Period = 30;

export function parsePeriod(value: string | string[] | undefined): Period {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return (PERIODS as readonly number[]).includes(n) ? (n as Period) : DEFAULT_PERIOD;
}

/** Calendar date (YYYY-MM-DD) in the admin time zone. */
export function toDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The last `days` calendar days, oldest first, ending today. */
export function periodDays(days: number, now = new Date()): string[] {
  const today = new Date(`${toDayKey(now)}T00:00:00${MOSCOW_OFFSET}`);
  return Array.from({ length: days }, (_, i) =>
    toDayKey(new Date(today.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000)),
  );
}

/** Start of the first day of the period (midnight Moscow time). */
export function periodStart(days: number, now = new Date()): Date {
  return new Date(`${periodDays(days, now)[0]}T00:00:00${MOSCOW_OFFSET}`);
}

/** Fills days without data with zeros so the chart has a point for every day. */
export function fillDailySeries(
  days: string[],
  conversations: { day: string; count: number }[],
  leads: { day: string; count: number }[],
) {
  const byDay = (rows: { day: string; count: number }[]) =>
    new Map(rows.map((r) => [r.day, Number(r.count)]));
  const c = byDay(conversations);
  const l = byDay(leads);
  return days.map((day) => ({ day, conversations: c.get(day) ?? 0, leads: l.get(day) ?? 0 }));
}

/** Share in percent rounded to one decimal, or null when there is nothing to divide by. */
export function percent(part: number, total: number): number | null {
  if (!total) return null;
  return Math.round((part / total) * 1000) / 10;
}
