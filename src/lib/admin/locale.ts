/**
 * Admin interface language. It is kept in a cookie, not in the URL: the proxy
 * rewrites /admin/... to the static /admin/{lang}/... pages, so addresses stay
 * the same and page shells stay prerendered.
 */
export const ADMIN_LANGS = ["ru", "en"] as const;
export type AdminLang = (typeof ADMIN_LANGS)[number];

export const ADMIN_LANG_COOKIE = "admin_lang";
export const DEFAULT_ADMIN_LANG: AdminLang = "ru";

export function parseAdminLang(value: string | undefined | null): AdminLang {
  return value === "en" ? "en" : DEFAULT_ADMIN_LANG;
}

/** Intl locale for dates and numbers in the admin interface. */
export const adminIntlLocale = (lang: AdminLang) => (lang === "en" ? "en-GB" : "ru-RU");
