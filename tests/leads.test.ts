import { describe, expect, it } from "vitest";
import { escapeHtml, fallbackSummary, formatLeadMessage } from "@/lib/telegram";
import { isInternationalPhone, leadFormSchema, leadRequestSchema } from "@/lib/validations/lead";

const valid = {
  name: "Анна",
  contact: "+7 900 123-45-67",
  courseId: "python",
  preferredChannel: "telegram" as const,
  comment: "",
  consent: true as const,
};

describe("isInternationalPhone", () => {
  it("accepts international numbers with separators", () => {
    expect(isInternationalPhone("+7 900 123-45-67")).toBe(true);
    expect(isInternationalPhone("+44 (20) 7946 0958")).toBe(true);
  });

  it("rejects local, too short or malformed numbers", () => {
    expect(isInternationalPhone("8 900 123-45-67")).toBe(false);
    expect(isInternationalPhone("+7 900")).toBe(false);
    expect(isInternationalPhone("+0 900 123 45 67")).toBe(false);
    expect(isInternationalPhone("+7 900 abc 45 67")).toBe(false);
  });
});

describe("leadFormSchema", () => {
  it("accepts a phone or an email", () => {
    expect(leadFormSchema.safeParse(valid).success).toBe(true);
    expect(leadFormSchema.safeParse({ ...valid, contact: "anna@example.com" }).success).toBe(true);
  });

  it("returns i18n keys for invalid fields", () => {
    const result = leadFormSchema.safeParse({
      ...valid,
      name: "А",
      contact: "89001234567",
      consent: false,
    });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries(
      result.error!.issues.map((i) => [i.path[0], i.message]),
    );
    expect(messages).toEqual({
      name: "nameShort",
      contact: "contactInvalid",
      consent: "consentRequired",
    });
  });

  it("requires a visitor id in the API request", () => {
    expect(leadRequestSchema.safeParse(valid).success).toBe(false);
    expect(leadRequestSchema.safeParse({ ...valid, visitorId: "visitor_12345" }).success).toBe(true);
  });
});

describe("telegram message", () => {
  it("escapes HTML in user input", () => {
    expect(escapeHtml(`<b>"Anna" & co</b>`)).toBe(`&lt;b&gt;"Anna" &amp; co&lt;/b&gt;`);
  });

  it("formats the lead as in SPEC 5.7", () => {
    const text = formatLeadMessage({
      name: "Анна <script>",
      contact: "+7 900 123-45-67",
      preferredChannel: "telegram",
      courseName: "Python-разработчик",
      comment: "Перезвоните после 18:00",
      summary: "Спрашивала о цене и рассрочке.",
      conversationUrl: "https://skillwave.academy/admin/conversations/abc",
    });
    expect(text).toBe(
      [
        "🎓 <b>Новая заявка из чата</b>",
        "👤 Анна &lt;script&gt;",
        "📞 +7 900 123-45-67 (удобно: Telegram)",
        "📚 Курс: Python-разработчик",
        "💬 Комментарий: Перезвоните после 18:00",
        "🧾 О чём спрашивал(а): Спрашивала о цене и рассрочке.",
        '🔗 <a href="https://skillwave.academy/admin/conversations/abc">Диалог в админ-панели</a>',
      ].join("\n"),
    );
  });

  it("omits empty optional lines", () => {
    const text = formatLeadMessage({
      name: "Ivan",
      contact: "ivan@example.com",
      preferredChannel: "email",
      courseName: null,
      comment: null,
      summary: null,
      conversationUrl: null,
    });
    expect(text.split("\n")).toHaveLength(3);
  });

  it("falls back to the last three questions", () => {
    expect(fallbackSummary(["a", "b", "c", "d"])).toBe("«b»; «c»; «d»");
    expect(fallbackSummary([])).toBeNull();
  });
});
