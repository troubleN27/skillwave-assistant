import { getSessionCookie } from "better-auth/cookies";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

const ADMIN_LOGIN_PATH = "/admin/login";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  return handleI18n(request);
}

/**
 * Optimistic check by cookie presence only. The session itself is verified
 * on the server in every admin page (`requireAdmin`).
 */
function guardAdmin(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === ADMIN_LOGIN_PATH;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!isLoginPage && !hasSessionCookie) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, the embed page, Next.js internals and static files.
  matcher: ["/((?!api|embed|_next|_vercel|.*\\..*).*)"],
};
