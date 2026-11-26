import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import ru from "../messages/ru.json";

const kb = (file: string) => readFileSync(`knowledge/${file}`, "utf8");
// Messages use non-breaking characters to keep numbers on one line.
const plain = (s: string) => s.replace(/[ ⁠]/g, (c) => (c === " " ? " " : ""));

describe("site texts match the knowledge base", () => {
  for (const [lang, messages, file] of [
    ["ru", ru, "teachers.md"],
    ["en", en, "teachers-en.md"],
  ] as const) {
    it(`teachers (${lang})`, () => {
      const doc = kb(file);
      for (const teacher of Object.values(messages.Site.teachers.items)) {
        expect(doc).toContain(teacher.name);
        expect(doc).toMatch(new RegExp(`${teacher.years} (лет|years)`));
      }
    });
  }

  it("numbers on the hero receipt", () => {
    const about = kb("about.md");
    const career = kb("certificates-and-career.md");
    const values = ru.Site.hero.receipt.rows.map((row) => plain(row.value));
    expect(values).toEqual(["12 000+", "78%", "150+", "≤ 25"]);
    expect(about).toContain("более 12 000 студентов");
    expect(career).toContain("78% выпускников");
    expect(career).toContain("более чем 150 IT-компаниями");
    expect(about).toContain("не больше 25 студентов");
  });
});
