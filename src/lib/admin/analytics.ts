import { and, count, eq, gte, sql } from "drizzle-orm";
import type { Database } from "@/db/client";
import { conversations, leads, messages } from "@/db/schema";
import { ADMIN_TIME_ZONE, fillDailySeries, percent, periodDays, periodStart } from "./period";
import { listUnansweredGroups } from "./unanswered";

export type DashboardSummary = {
  conversations: number;
  messages: number;
  leads: number;
  /** Conversations with a lead, % of conversations. */
  conversion: number | null;
  /** Assistant answers without context, % of assistant answers. */
  unansweredRate: number | null;
  /** 👍 among rated answers, %. */
  positiveRate: number | null;
  ratedAnswers: number;
};

async function scalar(query: Promise<{ value: number }[]>) {
  const [row] = await query;
  return Number(row?.value ?? 0);
}

export async function getDashboardSummary(db: Database, from: Date): Promise<DashboardSummary> {
  const [convs, msgs, leadCount, convsWithLead, answers, unanswered, up, down] =
    await Promise.all([
      scalar(db.select({ value: count() }).from(conversations).where(gte(conversations.createdAt, from))),
      scalar(db.select({ value: count() }).from(messages).where(gte(messages.createdAt, from))),
      scalar(db.select({ value: count() }).from(leads).where(gte(leads.createdAt, from))),
      scalar(
        db
          .select({ value: count() })
          .from(conversations)
          .where(and(gte(conversations.createdAt, from), eq(conversations.hasLead, true))),
      ),
      scalar(
        db
          .select({ value: count() })
          .from(messages)
          .where(and(gte(messages.createdAt, from), eq(messages.role, "assistant"))),
      ),
      scalar(
        db
          .select({ value: count() })
          .from(messages)
          .where(
            and(
              gte(messages.createdAt, from),
              eq(messages.role, "assistant"),
              eq(messages.answered, false),
            ),
          ),
      ),
      scalar(
        db
          .select({ value: count() })
          .from(messages)
          .where(and(gte(messages.createdAt, from), eq(messages.feedback, "up"))),
      ),
      scalar(
        db
          .select({ value: count() })
          .from(messages)
          .where(and(gte(messages.createdAt, from), eq(messages.feedback, "down"))),
      ),
    ]);

  return {
    conversations: convs,
    messages: msgs,
    leads: leadCount,
    conversion: percent(convsWithLead, convs),
    unansweredRate: percent(unanswered, answers),
    positiveRate: percent(up, up + down),
    ratedAnswers: up + down,
  };
}

// The time zone is inlined (a code constant, not user input): as a bound parameter
// the SELECT and GROUP BY expressions would differ ($1 vs $3) and Postgres rejects the query.
const TIME_ZONE_SQL = sql.raw(`'${ADMIN_TIME_ZONE}'`);

const dayOf = (column: typeof conversations.createdAt | typeof leads.createdAt) =>
  sql<string>`to_char(${column} at time zone ${TIME_ZONE_SQL}, 'YYYY-MM-DD')`;

/** Conversations and leads per calendar day (Moscow time), zeros included. */
export async function getDailySeries(db: Database, days: number) {
  const from = periodStart(days);
  const convDay = dayOf(conversations.createdAt);
  const leadDay = dayOf(leads.createdAt);
  const [convRows, leadRows] = await Promise.all([
    db
      .select({ day: convDay, count: count() })
      .from(conversations)
      .where(gte(conversations.createdAt, from))
      .groupBy(convDay),
    db
      .select({ day: leadDay, count: count() })
      .from(leads)
      .where(gte(leads.createdAt, from))
      .groupBy(leadDay),
  ]);
  return fillDailySeries(periodDays(days), convRows, leadRows);
}

export async function getTopUnanswered(db: Database, from: Date, limit = 10) {
  return (await listUnansweredGroups(db, "new", from)).slice(0, limit);
}
