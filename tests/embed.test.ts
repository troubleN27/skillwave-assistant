import { describe, expect, it } from "vitest";
import { buildFrameAncestors } from "@/lib/embed";

describe("buildFrameAncestors", () => {
  it("always allows the school site itself", () => {
    expect(buildFrameAncestors([])).toBe("'self'");
    expect(buildFrameAncestors(null)).toBe("'self'");
  });

  it("normalizes listed origins and drops duplicates and junk", () => {
    expect(
      buildFrameAncestors([
        "https://partner.example/page",
        "https://partner.example",
        "http://localhost:5500/",
        "javascript:alert(1)",
        "not a url",
      ]),
    ).toBe("'self' https://partner.example http://localhost:5500");
  });
});
