import { describe, expect, it } from "vitest";
import {
  createAdminSchema,
  loginSchema,
  parseCliArgs,
} from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "admin@skillwave.academy",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email and an empty password", () => {
    const result = loginSchema.safeParse({ email: "admin", password: "" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["email", "password"]));
  });
});

describe("createAdminSchema", () => {
  it("applies the default name", () => {
    const result = createAdminSchema.parse({
      email: "admin@skillwave.academy",
      password: "long-enough-password",
    });
    expect(result.name).toBe("Администратор");
  });

  it("rejects a short password", () => {
    const result = createAdminSchema.safeParse({
      email: "admin@skillwave.academy",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("parseCliArgs", () => {
  it("parses space-separated and inline values", () => {
    expect(
      parseCliArgs(["--email", "a@b.co", "--password=p@ss=word", "--name", "Анна"]),
    ).toEqual({ email: "a@b.co", password: "p@ss=word", name: "Анна" });
  });

  it("ignores flags without values and stray arguments", () => {
    expect(parseCliArgs(["stray", "--email", "--password", "x"])).toEqual({
      password: "x",
    });
  });
});
