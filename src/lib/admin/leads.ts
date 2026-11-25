import { desc, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { leads } from "@/db/schema";

export type LeadStatus = "new" | "in_progress" | "closed";

export async function listLeads(db: Database, status?: LeadStatus) {
  return db
    .select()
    .from(leads)
    .where(status ? eq(leads.status, status) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(500);
}

export async function updateLead(
  db: Database,
  id: string,
  data: { status?: LeadStatus; managerNote?: string | null },
) {
  const [row] = await db
    .update(leads)
    .set(data)
    .where(eq(leads.id, id))
    .returning({ id: leads.id });
  return Boolean(row);
}
