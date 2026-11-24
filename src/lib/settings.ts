import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { settings } from "@/db/schema";

export const DEFAULT_MIN_SIMILARITY = 0.55;

export async function getMinSimilarity(db: Database): Promise<number> {
  const [row] = await db
    .select({ minSimilarity: settings.minSimilarity })
    .from(settings)
    .where(eq(settings.id, 1));
  return row?.minSimilarity ?? DEFAULT_MIN_SIMILARITY;
}
