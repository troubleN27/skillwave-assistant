import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  cannedReply,
  formatContext,
  suggestsLeadForm,
} from "@/lib/ai/prompts";
import { safeHttpUrl } from "@/components/admin/format";
import { keepNumbersTogether } from "@/components/chat/chat-markdown";
import { detectLanguage } from "@/lib/language";
import { DAY_MS, getClientIp, VISITOR_WINDOW_MS, windowStart } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/settings";
import { chatRequestSchema, feedbackRequestSchema } from "@/lib/validations/chat";

describe("detectLanguage", () => {
  it("detects Russian and English by script", () => {
    expect(detectLanguage("Сколько стоит курс?", "en")).toBe("ru");
    expect(detectLanguage("How much is the course?", "ru")).toBe("en");
  });

  it("uses the dominant script in mixed text", () => {
    expect(detectLanguage("Сколько стоит курс UX/UI?", "en")).toBe("ru");
    expect(detectLanguage("Is there a Python курс?", "ru")).toBe("en");
  });

  it("falls back when there are no letters", () => {
    expect(detectLanguage("???  123", "en")).toBe("en");
  });
});

describe("formatContext", () => {
  it("numbers chunks and joins title with heading", () => {
    expect(
      formatContext([
        { documentTitle: "Оплата", heading: "Рассрочка", content: " 0% на 12 месяцев. " },
        { documentTitle: "FAQ", heading: null, content: "Текст" },
      ]),
    ).toBe("[1] Оплата — Рассрочка\n0% на 12 месяцев.\n\n[2] FAQ\nТекст");
  });
});

describe("buildSystemPrompt", () => {
  it("includes the assistant name, contacts, course ids and context", () => {
    const prompt = buildSystemPrompt(
      {
        assistantName: "Ассистент Skillwave",
        contactsRu: "Email: hello@skillwave.academy",
        contactsEn: null,
        courses: [{ id: "python", name_ru: "Python-разработчик", name_en: "Python Developer" }],
      },
      "[1] Doc\nText",
      "en",
    );
    expect(prompt).toContain("You are Ассистент Skillwave");
    expect(prompt).toContain("Reply in English");
    expect(prompt).toContain("hello@skillwave.academy");
    expect(prompt).toContain("- python: Python-разработчик / Python Developer");
    expect(prompt).toContain("<context>\n[1] Doc\nText\n</context>");
  });
});

describe("suggestsLeadForm", () => {
  it("detects offers to leave contacts in both languages", () => {
    expect(suggestsLeadForm("Оставьте заявку, и наш менеджер поможет вам определиться:")).toBe(true);
    expect(suggestsLeadForm("Если хотите, оставьте свои контакты — менеджер ответит.")).toBe(true);
    expect(suggestsLeadForm("Менеджер свяжется с вами в течение дня.")).toBe(true);
    expect(suggestsLeadForm("Please leave your contact details below.")).toBe(true);
    expect(suggestsLeadForm("A manager will get in touch shortly.")).toBe(true);
    expect(suggestsLeadForm("Если хотите записаться, я открою форму для связи ниже.")).toBe(true);
    expect(suggestsLeadForm("Please fill in the form below.")).toBe(true);
  });

  it("ignores regular answers", () => {
    expect(suggestsLeadForm("Полная стоимость курса — 95 000 ₽.")).toBe(false);
    expect(suggestsLeadForm("Contacts: hello@skillwave.academy")).toBe(false);
    expect(suggestsLeadForm("Вебинары проходят в 19:00 по Москве.")).toBe(false);
  });
});

describe("keepNumbersTogether", () => {
  it("joins thousands and currency with non-breaking spaces", () => {
    expect(keepNumbersTogether("от 5 750 ₽ в месяц, всего 62 100 ₽")).toBe(
      "от 5 750 ₽ в месяц, всего 62 100 ₽",
    );
    expect(keepNumbersTogether("from 7 917 RUB")).toBe("from 7 917 RUB");
  });

  it("leaves unrelated numbers alone", () => {
    expect(keepNumbersTogether("2 потока в 2027 году, 12 месяцев")).toBe(
      "2 потока в 2027 году, 12 месяцев",
    );
  });
});

describe("cannedReply", () => {
  it("returns texts in both languages", () => {
    expect(cannedReply("noContext", "ru")).toMatch(/нет точной информации/);
    expect(cannedReply("overloaded", "en")).toMatch(/temporarily overloaded/);
  });
});

describe("windowStart", () => {
  it("aligns to fixed windows", () => {
    const now = new Date("2026-11-25T10:17:42.000Z");
    expect(windowStart(now, VISITOR_WINDOW_MS).toISOString()).toBe("2026-11-25T10:10:00.000Z");
    expect(windowStart(now, DAY_MS).toISOString()).toBe("2026-11-25T00:00:00.000Z");
  });
});

describe("getClientIp", () => {
  it("prefers platform-set headers over client-controllable ones", () => {
    expect(
      getClientIp(
        new Headers({ "x-vercel-forwarded-for": "5.6.7.8", "x-forwarded-for": "1.1.1.1, 5.6.7.8" }),
      ),
    ).toBe("5.6.7.8");
    expect(getClientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("uses the last x-forwarded-for entry (added by the nearest proxy)", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 1.2.3.4" }))).toBe("1.2.3.4");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("isAllowedOrigin", () => {
  const site = "http://localhost:3000";

  it("allows the school site and listed origins", () => {
    expect(isAllowedOrigin("http://localhost:3000", site, [])).toBe(true);
    expect(isAllowedOrigin("https://partner.example", site, ["https://partner.example/"])).toBe(true);
  });

  it("rejects missing, unknown or malformed origins", () => {
    expect(isAllowedOrigin(null, site, [])).toBe(false);
    expect(isAllowedOrigin("https://evil.example", site, ["https://partner.example"])).toBe(false);
    expect(isAllowedOrigin("not a url", site, null)).toBe(false);
    expect(isAllowedOrigin("http://localhost:3001", site, [])).toBe(false);
  });
});

describe("chat validation", () => {
  const base = {
    id: "3f1d2c4b-8a7e-4c1d-9b2a-1e2f3a4b5c6d",
    visitorId: "visitor_12345",
    text: "  Сколько стоит курс?  ",
  };

  it("accepts a valid request, trims text and defaults locale", () => {
    const parsed = chatRequestSchema.parse(base);
    expect(parsed.text).toBe("Сколько стоит курс?");
    expect(parsed.locale).toBe("ru");
  });

  it("rejects empty, too long and malformed input", () => {
    expect(chatRequestSchema.safeParse({ ...base, text: "   " }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ ...base, text: "a".repeat(1001) }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ ...base, id: "123" }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ ...base, visitorId: "<script>" }).success).toBe(false);
  });

  it("accepts only http(s) page URLs", () => {
    expect(chatRequestSchema.safeParse({ ...base, pageUrl: "https://skillwave.academy/ru" }).success).toBe(true);
    expect(chatRequestSchema.safeParse({ ...base, pageUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ ...base, pageUrl: "data:text/html,hi" }).success).toBe(false);
  });

  it("renders only http(s) URLs as links in the admin panel", () => {
    expect(safeHttpUrl("https://partner.example/page")).toBe("https://partner.example/page");
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });

  it("validates feedback values", () => {
    const feedback = { messageId: base.id, visitorId: base.visitorId, value: "down" };
    expect(feedbackRequestSchema.safeParse(feedback).success).toBe(true);
    expect(feedbackRequestSchema.safeParse({ ...feedback, value: "meh" }).success).toBe(false);
  });
});
