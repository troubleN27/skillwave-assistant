import { after, NextResponse } from "next/server";
import { db } from "@/db";
import { createLead, notifyManager } from "@/lib/leads";
import { getClientIp, incrementCounter } from "@/lib/rate-limit";
import { getSettings, isAllowedOrigin } from "@/lib/settings";
import { leadRequestSchema } from "@/lib/validations/lead";

const HOUR_MS = 60 * 60 * 1000;
const LEADS_PER_VISITOR_PER_HOUR = 3;
const LEADS_PER_IP_PER_HOUR = 10;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Lead form submission from the chat (SPEC 5.7). */
export async function POST(request: Request) {
  const settings = await getSettings(db);
  if (
    !isAllowedOrigin(
      request.headers.get("origin"),
      process.env.NEXT_PUBLIC_SITE_URL,
      settings.allowedOrigins,
    )
  ) {
    return error("Запросы с этого сайта не разрешены", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Некорректный запрос", 400);
  }
  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", fields: parsed.error.issues.map((i) => i.path.join(".")) },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Bots fill the hidden field: pretend success, store nothing.
  if (input.website) return NextResponse.json({ ok: true });

  const ip = getClientIp(request.headers);
  const [byVisitor, byIp] = await Promise.all([
    incrementCounter(db, `lead:${input.visitorId}`, HOUR_MS),
    incrementCounter(db, `lead-ip:${ip}`, HOUR_MS),
  ]);
  if (byVisitor > LEADS_PER_VISITOR_PER_HOUR || byIp > LEADS_PER_IP_PER_HOUR) {
    return error("rate_limited", 429);
  }

  const created = await createLead(db, input);
  after(() => notifyManager(db, input, created));

  return NextResponse.json({ ok: true });
}
