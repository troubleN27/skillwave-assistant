import { describe, expect, it } from "vitest";
import { settingsSchema, toLines, toOrigin, type SettingsFormValues } from "@/lib/validations/settings";

const valid: SettingsFormValues = {
  assistantNameRu: "Ассистент Skillwave",
  assistantNameEn: "Skillwave Assistant",
  welcomeRu: "Здравствуйте!",
  welcomeEn: "",
  quickQuestionsRu: "Есть ли рассрочка?\n\n  Какой курс выбрать?  ",
  quickQuestionsEn: "",
  contactsRu: "hello@skillwave.academy",
  contactsEn: "",
  courses: [{ id: "python", name_ru: "Python-разработчик", name_en: "Python Developer" }],
  allowedOrigins: "https://partner.example/page\npartner2.example\nhttps://partner.example",
  maxMessagesPerConversation: "30",
  maxMessagesPerDay: 500,
  minSimilarity: "0.69",
  telegramNotifications: true,
};

describe("settings helpers", () => {
  it("splits lines and normalizes origins", () => {
    expect(toLines(" a \n\n b\r\n")).toEqual(["a", "b"]);
    expect(toOrigin("https://partner.example/page?x=1")).toBe("https://partner.example");
    expect(toOrigin("partner.example")).toBe("https://partner.example");
    expect(toOrigin("ftp://partner.example")).toBeNull();
  });
});

describe("settingsSchema", () => {
  it("parses form values into stored settings", () => {
    const parsed = settingsSchema.parse(valid);
    expect(parsed.quickQuestionsRu).toEqual(["Есть ли рассрочка?", "Какой курс выбрать?"]);
    expect(parsed.quickQuestionsEn).toEqual([]);
    expect(parsed.welcomeEn).toBeNull();
    expect(parsed.allowedOrigins).toEqual(["https://partner.example", "https://partner2.example"]);
    expect(parsed.maxMessagesPerConversation).toBe(30);
    expect(parsed.minSimilarity).toBe(0.69);
  });

  it("rejects invalid values", () => {
    const bad = (patch: Partial<SettingsFormValues>) => settingsSchema.safeParse({ ...valid, ...patch }).success;
    expect(bad({ quickQuestionsRu: "1\n2\n3\n4\n5" })).toBe(false);
    expect(bad({ allowedOrigins: "javascript:alert(1)" })).toBe(false);
    expect(bad({ minSimilarity: "1.5" })).toBe(false);
    expect(bad({ maxMessagesPerConversation: "2" })).toBe(false);
    expect(
      bad({
        courses: [
          { id: "python", name_ru: "Python", name_en: "Python" },
          { id: "python", name_ru: "Python 2", name_en: "Python 2" },
        ],
      }),
    ).toBe(false);
    expect(bad({ courses: [{ id: "Python Course", name_ru: "Python", name_en: "Python" }] })).toBe(false);
  });
});
