/**
 * Creates an admin account (public sign-up is disabled).
 *
 * Usage:
 *   npm run create-admin -- --email admin@skillwave.academy --password "..." [--name "Имя"]
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

async function main() {
  const { createDb } = await import("../src/db/client");
  const { createAuth } = await import("../src/lib/auth-config");
  const { createAdminSchema, parseCliArgs } = await import(
    "../src/lib/validations/auth"
  );

  const parsed = createAdminSchema.safeParse(parseCliArgs(process.argv.slice(2)));
  if (!parsed.success) {
    console.error("Invalid arguments:");
    for (const issue of parsed.error.issues) {
      console.error(`  --${issue.path.join(".")}: ${issue.message}`);
    }
    console.error(
      '\nUsage: npm run create-admin -- --email <email> --password <password> [--name "<name>"]',
    );
    process.exit(1);
  }

  const { email, password, name } = parsed.data;
  const auth = createAuth(createDb());
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(email.toLowerCase());
  if (existing) {
    console.error(`An account with email ${email} already exists.`);
    process.exit(1);
  }

  const user = await ctx.internalAdapter.createUser(
    { email: email.toLowerCase(), name, emailVerified: true },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });

  console.log(`Admin created: ${user.email}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Failed to create admin:", error instanceof Error ? error.message : error);
  process.exit(1);
});
