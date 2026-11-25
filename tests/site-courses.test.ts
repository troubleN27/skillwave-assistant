import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COURSES, fullPaymentPrice } from "@/lib/site/courses";

const files: Record<string, string> = {
  frontend: "course-frontend.md",
  "ux-ui": "course-ux-ui.md",
  python: "course-python.md",
  "data-analyst": "course-data-analyst.md",
  marketing: "course-marketing.md",
};

const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;

describe("site course data matches the knowledge base", () => {
  for (const course of COURSES) {
    it(course.id, () => {
      const doc = readFileSync(`knowledge/${files[course.id]}`, "utf8");
      expect(doc).toContain(`**${course.months} месяцев**`);
      expect(doc).toContain(`**${rub(course.price)}**`);
      expect(doc).toContain(`**${rub(course.monthly)} в месяц**`);
      expect(doc).toContain(`**${rub(fullPaymentPrice(course.price))}**`);
      const [y, m, d] = course.start.split("-").map(Number);
      const month = new Intl.DateTimeFormat("ru-RU", { month: "long", day: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(y, m - 1, d)));
      expect(doc).toContain(`**${month} ${y} года**`);
    });
  }
});
