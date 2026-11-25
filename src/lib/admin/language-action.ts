"use server";

import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, parseAdminLang } from "./locale";

/** Saves the admin interface language; the proxy reads it on the next request. */
export async function setAdminLanguage(lang: string) {
  (await cookies()).set(ADMIN_LANG_COOKIE, parseAdminLang(lang), {
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
