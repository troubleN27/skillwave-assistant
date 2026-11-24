/**
 * Retrieval quality check (SPEC 10): hit@5 for answerable questions and how
 * well the confidence threshold rejects questions without an answer in the
 * knowledge base and off-topic questions.
 *
 * Usage: npm run eval [-- --threshold 0.62]
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";

config({ path: ".env.local", quiet: true });

type Question = { question: string; lang: "ru" | "en"; expected?: string[] };
type QuestionSet = { answerable: Question[]; noAnswer: Question[]; offTopic: Question[] };

type Measured = Question & {
  kind: keyof QuestionSet;
  topTitles: string[];
  maxSimilarity: number;
  textResultCount: number;
  hit: boolean;
};

const TARGET_HIT_RATE = 0.9;
/**
 * The recommended threshold must keep every answerable question even if it
 * were this much higher — a safety margin against overfitting a small set.
 */
const SAFETY_MARGIN = 0.02;

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

function passes(m: Measured, threshold: number) {
  return m.textResultCount > 0 || m.maxSimilarity >= threshold;
}

function rates(results: Measured[], threshold: number) {
  const byKind = (kind: keyof QuestionSet) => results.filter((r) => r.kind === kind);
  const answerable = byKind("answerable");
  const rejectable = [...byKind("noAnswer"), ...byKind("offTopic")];
  return {
    answerablePass: answerable.filter((r) => passes(r, threshold)).length / answerable.length,
    noAnswerRejected:
      byKind("noAnswer").filter((r) => !passes(r, threshold)).length / byKind("noAnswer").length,
    offTopicRejected:
      byKind("offTopic").filter((r) => !passes(r, threshold)).length / byKind("offTopic").length,
    rejected: rejectable.filter((r) => !passes(r, threshold)).length,
  };
}

function parseThreshold(): number | null {
  const index = process.argv.indexOf("--threshold");
  if (index === -1) return null;
  const value = Number(process.argv[index + 1]);
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    console.error("--threshold must be a number between 0 and 1");
    process.exit(1);
  }
  return value;
}

async function main() {
  const { createDb } = await import("../src/db/client");
  const { retrieve } = await import("../src/lib/rag/retrieve");
  const { getMinSimilarity } = await import("../src/lib/settings");

  const db = createDb();
  const set = JSON.parse(await readFile("evals/questions.json", "utf8")) as QuestionSet;
  const currentThreshold = parseThreshold() ?? (await getMinSimilarity(db));

  const results: Measured[] = [];
  for (const kind of ["answerable", "noAnswer", "offTopic"] as const) {
    for (const q of set[kind]) {
      const r = await retrieve(db, q.question, currentThreshold);
      const topTitles = r.chunks.map((c) => c.documentTitle);
      results.push({
        ...q,
        kind,
        topTitles,
        maxSimilarity: r.maxSimilarity,
        textResultCount: r.textResultCount,
        hit: kind === "answerable" && topTitles.some((t) => q.expected?.includes(t)),
      });
      process.stdout.write(".");
    }
  }
  console.log("\n");

  // Hit@5
  const answerable = results.filter((r) => r.kind === "answerable");
  const hits = answerable.filter((r) => r.hit).length;
  const hitRate = hits / answerable.length;
  for (const lang of ["ru", "en"] as const) {
    const subset = answerable.filter((r) => r.lang === lang);
    console.log(`Hit@5 ${lang.toUpperCase()}: ${subset.filter((r) => r.hit).length}/${subset.length}`);
  }
  console.log(
    `Hit@5 total: ${hits}/${answerable.length} = ${pct(hitRate)} (target ≥ ${pct(TARGET_HIT_RATE)}) ${hitRate >= TARGET_HIT_RATE ? "✓" : "✗"}\n`,
  );

  // Similarity overview
  const sims = (kind: keyof QuestionSet) =>
    results.filter((r) => r.kind === kind).map((r) => r.maxSimilarity);
  for (const kind of ["answerable", "noAnswer", "offTopic"] as const) {
    const values = sims(kind);
    console.log(
      `${kind.padEnd(10)} max similarity: min ${Math.min(...values).toFixed(3)}, max ${Math.max(...values).toFixed(3)}, FTS matches: ${results.filter((r) => r.kind === kind && r.textResultCount > 0).length}`,
    );
  }

  // Threshold sweep
  console.log("\nThreshold | answerable pass | no-answer rejected | off-topic rejected");
  let best: { threshold: number; rejected: number; answerablePass: number } | null = null;
  for (let t = 0.5; t <= 0.851; t += 0.01) {
    const threshold = Number(t.toFixed(2));
    const r = rates(results, threshold);
    console.log(
      `${threshold.toFixed(2).padStart(9)} | ${pct(r.answerablePass).padStart(15)} | ${pct(r.noAnswerRejected).padStart(18)} | ${pct(r.offTopicRejected).padStart(18)}`,
    );
    const withMargin = rates(results, threshold + SAFETY_MARGIN);
    if (withMargin.answerablePass === 1 && (!best || r.rejected > best.rejected)) {
      best = { threshold, rejected: r.rejected, answerablePass: r.answerablePass };
    }
  }

  const current = rates(results, currentThreshold);
  console.log(
    `\nCurrent threshold ${currentThreshold.toFixed(2)}: answerable pass ${pct(current.answerablePass)}, no-answer rejected ${pct(current.noAnswerRejected)}, off-topic rejected ${pct(current.offTopicRejected)}`,
  );
  if (best) {
    console.log(
      `Recommended threshold: ${best.threshold.toFixed(2)} (keeps ${pct(best.answerablePass)} of answerable questions with a ${SAFETY_MARGIN} margin, rejects ${best.rejected} of ${set.noAnswer.length + set.offTopic.length} others)`,
    );
  }

  // Failures
  const failures = results.filter((r) =>
    r.kind === "answerable" ? !r.hit || !passes(r, currentThreshold) : passes(r, currentThreshold),
  );
  if (failures.length) {
    console.log("\nFailures at the current threshold:");
    for (const f of failures) {
      const why =
        f.kind === "answerable"
          ? !f.hit
            ? `expected ${f.expected?.join(" | ")}`
            : "below threshold"
          : "not rejected";
      console.log(
        `- [${f.kind}] ${f.question}\n    ${why}; max sim ${f.maxSimilarity.toFixed(3)}, FTS ${f.textResultCount}; top: ${[...new Set(f.topTitles)].join(", ")}`,
      );
    }
  }

  process.exit(hitRate >= TARGET_HIT_RATE ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error("Eval failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
