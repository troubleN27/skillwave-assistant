import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Returns the current admin session or redirects to the login page.
 *
 * Not wrapped in React `cache()` on purpose: with Cache Components a shared
 * promise created by the layout would make page-level Suspense boundaries
 * wait on I/O started above them, which blocks instant navigation.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login");
  return session;
}
