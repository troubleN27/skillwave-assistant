import "server-only";
import { getActionTranslations } from "./i18n";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Turns a failed zod parse into a translated error. Schema messages are keys
 * of the Admin.validation namespace; anything else falls back to a generic text.
 */
export async function invalid(error: { issues: { message: string }[] }): Promise<ActionResult> {
  const t = await getActionTranslations("Admin.validation");
  const key = error.issues[0]?.message;
  return { ok: false, error: key && t.has(key) ? t(key) : t("formInvalid") };
}

/** A translated error from the Admin.validation namespace. */
export async function failure(key: string): Promise<ActionResult> {
  const t = await getActionTranslations("Admin.validation");
  return { ok: false, error: t(key) };
}
