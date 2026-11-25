import { describe, expect, it } from "vitest";
import {
  fillDailySeries,
  parsePeriod,
  percent,
  periodDays,
  periodStart,
} from "@/lib/admin/period";
import { groupUnanswered, normalizeQuestion } from "@/lib/admin/unanswered";

describe("period", () => {
  it("parses allowed periods and falls back to 30", () => {
    expect(parsePeriod("7")).toBe(7);
    expect(parsePeriod(["90"])).toBe(90);
    expect(parsePeriod("14")).toBe(30);
    expect(parsePeriod(undefined)).toBe(30);
  });

  it("lists calendar days in Moscow time, ending today", () => {
    // 22:30 UTC on Nov 24 is already Nov 25 in Moscow.
    const now = new Date("2026-11-24T22:30:00Z");
    expect(periodDays(3, now)).toEqual(["2026-11-23", "2026-11-24", "2026-11-25"]);
    expect(periodStart(3, now).toISOString()).toBe("2026-11-22T21:00:00.000Z");
  });

  it("fills missing days with zeros", () => {
    expect(
      fillDailySeries(
        ["2026-11-24", "2026-11-25"],
        [{ day: "2026-11-25", count: 3 }],
        [{ day: "2026-11-24", count: 1 }],
      ),
    ).toEqual([
      { day: "2026-11-24", conversations: 0, leads: 1 },
      { day: "2026-11-25", conversations: 3, leads: 0 },
    ]);
  });

  it("computes percentages and handles empty totals", () => {
    expect(percent(1, 3)).toBe(33.3);
    expect(percent(0, 0)).toBeNull();
  });
});

describe("unanswered grouping", () => {
  it("normalizes case, punctuation, spaces and ё", () => {
    expect(normalizeQuestion("  Есть ли курс по Java?!  ")).toBe("есть ли курс по java");
    expect(normalizeQuestion("Ещё вопрос")).toBe(normalizeQuestion("еще  вопрос."));
  });

  it("groups similar questions, most frequent first", () => {
    const at = (h: number) => new Date(`2026-11-25T${String(h).padStart(2, "0")}:00:00Z`);
    const groups = groupUnanswered([
      { id: "1", question: "Есть ли курс по Java?", reason: "no_context", createdAt: at(1), conversationId: "a" },
      { id: "2", question: "есть ли курс по java", reason: "negative_feedback", createdAt: at(3), conversationId: "b" },
      { id: "3", question: "Налоговый вычет?", reason: "no_context", createdAt: at(5), conversationId: "c" },
    ]);
    expect(groups.map((g) => [g.question, g.count])).toEqual([
      ["есть ли курс по java", 2],
      ["Налоговый вычет?", 1],
    ]);
    expect(groups[0].reasons.sort()).toEqual(["negative_feedback", "no_context"]);
    expect(groups[0].ids.sort()).toEqual(["1", "2"]);
    expect(groups[0].conversationIds.sort()).toEqual(["a", "b"]);
  });
});
