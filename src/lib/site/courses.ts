/** Course facts shown on the site; must match knowledge/course-*.md. */
export type SiteCourse = {
  id: "frontend" | "ux-ui" | "python" | "data-analyst" | "marketing";
  months: number;
  price: number;
  monthly: number;
  start: string; // ISO date of the next cohort
  projects: number;
};

export const COURSES: SiteCourse[] = [
  { id: "frontend", months: 9, price: 89_000, monthly: 7_417, start: "2027-01-19", projects: 6 },
  { id: "ux-ui", months: 6, price: 69_000, monthly: 5_750, start: "2027-01-26", projects: 4 },
  { id: "python", months: 10, price: 95_000, monthly: 7_917, start: "2027-02-02", projects: 5 },
  { id: "data-analyst", months: 8, price: 85_000, monthly: 7_084, start: "2027-02-09", projects: 5 },
  { id: "marketing", months: 5, price: 59_000, monthly: 4_917, start: "2026-12-15", projects: 4 },
];

export const MAX_COURSE_MONTHS = Math.max(...COURSES.map((c) => c.months));

/** Price with a 10% discount for paying the whole course at once. */
export const fullPaymentPrice = (price: number) => Math.round(price * 0.9);

export function formatRub(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStartDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** "15 December" / "15 декабря" — for the next-start stamp. */
export function formatDayMonth(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** The course whose cohort starts first. */
export const nextCohort = (): SiteCourse =>
  [...COURSES].sort((a, b) => a.start.localeCompare(b.start))[0];

export const CONTACTS = {
  email: "hello@skillwave.academy",
  phone: "+7 800 555-27-41",
  phoneHref: "tel:+78005552741",
  telegram: "@skillwave_academy",
  telegramHref: "https://t.me/skillwave_academy",
};
