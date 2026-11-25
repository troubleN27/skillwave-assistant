import { z } from "zod";

export const loginSchema = z.object({
  // Messages are keys of the Admin.validation namespace.
  email: z.email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createAdminSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  name: z.string().trim().min(1).max(60).default("Администратор"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

/** Parses `--email x --password y [--name z]` style CLI arguments. */
export function parseCliArgs(argv: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const body = arg.slice(2);
    const eq = body.indexOf("=");
    const key = eq === -1 ? body : body.slice(0, eq);
    if (eq !== -1) {
      result[key] = body.slice(eq + 1);
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
      result[key] = argv[++i];
    }
  }
  return result;
}
