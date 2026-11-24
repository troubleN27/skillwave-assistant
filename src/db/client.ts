import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Pooled Neon connection over WebSockets. Unlike the HTTP driver it supports
 * interactive transactions (used by Better Auth and document indexing).
 * Imported directly only by CLI scripts; app code uses `@/db`.
 */
export function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (see .env.example)");
  }
  const pool = new Pool({ connectionString });
  return drizzle({ client: pool, schema });
}

export type Database = ReturnType<typeof createDb>;
