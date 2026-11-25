import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { loadConversationMessages } from "@/lib/chat/history";
import { visitorIdSchema } from "@/lib/validations/chat";

const querySchema = z.object({ id: z.uuid(), visitorId: visitorIdSchema });

/** History of the visitor's current conversation (SPEC 6.2). */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const messages = await loadConversationMessages(db, parsed.data.id, parsed.data.visitorId);
  // An unknown conversation is simply empty: the visitor may not have written yet.
  return NextResponse.json(
    { messages: messages ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
