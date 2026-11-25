import "server-only";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ADMIN_LANG_COOKIE, parseAdminLang, type AdminLang } from "./locale";

/**
 * Interface language inside Server Actions, which run outside the
 * /admin/[lang] page tree: read it from the same cookie the proxy uses.
 */
export async function getActionLang(): Promise<AdminLang> {
  return parseAdminLang((await cookies()).get(ADMIN_LANG_COOKIE)?.value);
}

/** Translations for messages returned by admin Server Actions. */
export async function getActionTranslations(namespace: string) {
  return getTranslations({ locale: await getActionLang(), namespace });
}
