import { NextResponse } from "next/server";
import { db } from "@/db";
import { saveFeedback } from "@/lib/chat/feedback";
import { getSettings, isAllowedOrigin } from "@/lib/settings";
import { feedbackRequestSchema } from "@/lib/validations/chat";

/** 👍/👎 for an assistant answer (SPEC 5.8). */
export async function POST(request: Request) {
  const settings = await getSettings(db);
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, process.env.NEXT_PUBLIC_SITE_URL, settings.allowedOrigins)) {
    return NextResponse.json({ error: "Запросы с этого сайта не разрешены" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректный запрос" },
      { status: 400 },
    );
  }

  const result = await saveFeedback(db, parsed.data);
  if (result === "not_found") {
    return NextResponse.json({ error: "Сообщение не найдено" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
