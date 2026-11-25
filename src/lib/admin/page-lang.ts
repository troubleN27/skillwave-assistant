import "server-only";
import { lang } from "next/root-params";
import { setRequestLocale } from "next-intl/server";
import { parseAdminLang, type AdminLang } from "./locale";

/**
 * Language of the current admin page, read from the [lang] root parameter.
 * It is known at build time, so pages can use it outside Suspense even when
 * other params (like a conversation id) are only known per request.
 * Also tells next-intl which locale this render uses.
 */
export async function getAdminLang(): Promise<AdminLang> {
  const value = parseAdminLang(await lang());
  setRequestLocale(value);
  return value;
}
