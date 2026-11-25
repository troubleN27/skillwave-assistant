import { getSessionCookie } from "better-auth/cookies";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { routing } from "@/i18n/routing";
import { ADMIN_LANG_COOKIE, parseAdminLang } from "@/lib/admin/locale";
import { buildFrameAncestors } from "@/lib/embed";
import { getSettings } from "@/lib/settings";

const handleI18n = createIntlMiddleware(routing);

const ADMIN_LOGIN_PATH = "/admin/login";
const FRAME_ANCESTORS_TTL_MS = 60_000;

let frameAncestorsCache: { value: string; expiresAt: number } | null = null;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }
  if (pathname === "/embed" || pathname.startsWith("/embed/")) {
    return embedResponse(request);
  }

  return handleI18n(request);
}

/**
 * Optimistic check by cookie presence only. The session itself is verified
 * on the server in every admin page (`requireAdmin`).
 *
 * /admin/... is rewritten to the static /admin/{lang}/... pages by the
 * interface-language cookie, so the address bar never shows the language.
 */
function guardAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Direct /admin/en/... links: remember the language and drop it from the URL.
  const direct = pathname.match(/^\/admin\/(ru|en)(\/.*)?$/);
  if (direct) {
    const response = NextResponse.redirect(new URL(`/admin${direct[2] ?? ""}${search}`, request.url));
    response.cookies.set(ADMIN_LANG_COOKIE, direct[1], { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!isLoginPage && !hasSessionCookie) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  const lang = parseAdminLang(request.cookies.get(ADMIN_LANG_COOKIE)?.value);
  const rest = pathname.slice("/admin".length);
  return NextResponse.rewrite(new URL(`/admin/${lang}${rest}${search}`, request.url));
}

/**
 * /embed?lang=ru|en is rewritten to the static /embed/{lang} page. It may be
 * framed only by the school site and settings.allowed_origins (SPEC 6.6).
 */
async function embedResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  let response: NextResponse;
  if (pathname === "/embed") {
    const lang = searchParams.get("lang") === "en" ? "en" : "ru";
    response = NextResponse.rewrite(new URL(`/embed/${lang}`, request.url));
  } else {
    response = NextResponse.next();
  }
  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${await getFrameAncestors()}`,
  );
  return response;
}

async function getFrameAncestors(): Promise<string> {
  const now = Date.now();
  if (frameAncestorsCache && frameAncestorsCache.expiresAt > now) {
    return frameAncestorsCache.value;
  }
  try {
    const settings = await getSettings(db);
    const value = buildFrameAncestors(settings.allowedOrigins);
    frameAncestorsCache = { value, expiresAt: now + FRAME_ANCESTORS_TTL_MS };
    return value;
  } catch (error) {
    console.error("Failed to load allowed origins for /embed", error);
    // Fail closed: only the school site itself may frame the chat.
    return frameAncestorsCache?.value ?? "'self'";
  }
}

export const config = {
  // Skip API routes, Next.js internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
