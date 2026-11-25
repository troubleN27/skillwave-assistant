import { lt, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { rateLimits } from "@/db/schema";

export const VISITOR_LIMIT = 20;
export const VISITOR_WINDOW_MS = 10 * 60 * 1000;
/** visitorId is chosen by the client, so IP addresses get their own, looser limit. */
export const IP_LIMIT = 60;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the fixed window containing `now` (windows are aligned to the epoch, i.e. UTC days). */
export function windowStart(now: Date, sizeMs: number): Date {
  return new Date(Math.floor(now.getTime() / sizeMs) * sizeMs);
}

/** Atomically increments the counter for `key` in the current window and returns the new value. */
export async function incrementCounter(
  db: Database,
  key: string,
  sizeMs: number,
  now = new Date(),
): Promise<number> {
  const start = windowStart(now, sizeMs);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: start, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });
  return row.count;
}

export type LimitCheck =
  | { ok: true }
  | { ok: false; scope: "visitor" | "ip" | "site" | "conversation" };

/**
 * Checks SPEC 5.6 limits for one incoming visitor message: per visitor
 * (visitorId + IP), per day for the whole site, and per conversation.
 */
export async function checkMessageLimits(
  db: Database,
  {
    visitorId,
    ip,
    userMessagesInConversation,
    maxPerConversation,
    maxPerDay,
  }: {
    visitorId: string;
    ip: string;
    userMessagesInConversation: number;
    maxPerConversation: number;
    maxPerDay: number;
  },
): Promise<LimitCheck> {
  if (userMessagesInConversation >= maxPerConversation) {
    return { ok: false, scope: "conversation" };
  }

  const visitorCount = await incrementCounter(
    db,
    `visitor:${visitorId}:${ip}`,
    VISITOR_WINDOW_MS,
  );
  if (visitorCount > VISITOR_LIMIT) return { ok: false, scope: "visitor" };

  const ipCount = await incrementCounter(db, `ip:${ip}`, VISITOR_WINDOW_MS);
  if (ipCount > IP_LIMIT) return { ok: false, scope: "ip" };

  const siteCount = await incrementCounter(db, "site", DAY_MS);
  if (siteCount === 1) {
    // First message of the day: drop windows older than two days.
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(Date.now() - 2 * DAY_MS)));
  }
  if (siteCount > maxPerDay) return { ok: false, scope: "site" };

  return { ok: true };
}

/**
 * Client IP from headers set by the platform. On Vercel `x-vercel-forwarded-for`
 * and `x-real-ip` are written by the edge and can't be spoofed by the client;
 * for `x-forwarded-for` the last entry is the one added by the nearest proxy.
 */
export function getClientIp(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return vercel || realIp || forwarded || "unknown";
}
