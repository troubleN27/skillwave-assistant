import { describe, expect, it } from "vitest";
import { toUIMessages } from "@/lib/chat/history";
import { visibleSources } from "@/lib/chat/sources";

const ru = { documentId: "d-ru", title: "Преподаватели Skillwave Academy", language: "ru" as const };
const en = { documentId: "d-en", title: "Skillwave Academy teachers", language: "en" as const };

describe("visibleSources", () => {
  it("keeps only documents in the reply language when there are any", () => {
    expect(visibleSources([ru, en, ru], "en")).toEqual([{ documentId: "d-en", title: en.title }]);
    expect(visibleSources([en, ru], "ru")).toEqual([{ documentId: "d-ru", title: ru.title }]);
  });

  it("falls back to all documents when none match the reply language", () => {
    expect(visibleSources([ru, ru], "en")).toEqual([{ documentId: "d-ru", title: ru.title }]);
  });

  it("keeps everything for sources saved without a language", () => {
    const legacy = [
      { documentId: "a", title: "A" },
      { documentId: "b", title: "B" },
    ];
    expect(visibleSources(legacy, "ru")).toHaveLength(2);
  });
});

describe("toUIMessages", () => {
  it("shows history sources in the language of the stored answer", () => {
    const [message] = toUIMessages([
      {
        id: "m1",
        role: "assistant",
        content: "The Python course is taught by Sergey Kovalev.",
        sources: [ru, en],
        answered: true,
        feedback: null,
      },
    ]);
    const part = message.parts.find((p) => p.type === "data-sources");
    expect(part && "data" in part ? part.data : null).toEqual([{ documentId: "d-en", title: en.title }]);
  });
});
