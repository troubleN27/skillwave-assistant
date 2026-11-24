import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import type { Database } from "@/db/client";
import * as schema from "@/db/schema";

/**
 * Better Auth configuration shared by the app (`@/lib/auth`) and CLI scripts.
 */
export function createAuth(db: Database) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Administrators are created manually with `npm run create-admin`.
      disableSignUp: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    // Must stay the last plugin.
    plugins: [nextCookies()],
  });
}
