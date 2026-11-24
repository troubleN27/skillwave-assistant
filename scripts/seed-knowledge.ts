/**
 * Indexes every Markdown file in `knowledge/`. The document title is the
 * first `# heading`; re-running updates documents with the same title and
 * skips unchanged ones.
 *
 * Usage: npm run seed:knowledge [-- --force]
 */
import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env.local", quiet: true });

const KNOWLEDGE_DIR = path.resolve("knowledge");

function parseMarkdown(fileName: string, raw: string) {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  const titleMatch = /^#\s+(.+)$/m.exec(text);
  const title = titleMatch?.[1].trim() ?? path.basename(fileName, ".md");
  const language = /-en\.md$/i.test(fileName) ? "en" : "ru";
  return { title, language, content: text } as const;
}

async function main() {
  const { createDb } = await import("../src/db/client");
  const { createDocument, findDocumentByTitle, updateDocument } = await import(
    "../src/lib/rag/documents"
  );
  const { indexDocument } = await import("../src/lib/rag/ingest");

  const db = createDb();
  // Unchanged ready documents are skipped to save Gemini quota; --force reindexes all.
  const force = process.argv.includes("--force");
  const files = (await readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) {
    console.error(`No Markdown files found in ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const doc = parseMarkdown(file, await readFile(path.join(KNOWLEDGE_DIR, file), "utf8"));
    const existing = await findDocumentByTitle(db, doc.title);
    const unchanged =
      existing?.status === "ready" &&
      existing.content === doc.content &&
      existing.language === doc.language;
    if (unchanged && !force) {
      console.log(`· ${file} — unchanged, skipped`);
      continue;
    }

    let id: string;
    if (existing) {
      id = existing.id;
      await updateDocument(db, id, {
        language: doc.language,
        content: doc.content,
      });
    } else {
      id = await createDocument(db, { ...doc, sourceType: "md" });
    }

    const result = await indexDocument(db, id);
    const action = existing ? "updated" : "created";
    if (result.ok) {
      console.log(`✓ ${file} — ${action}, ${result.chunkCount} chunks`);
    } else {
      failed++;
      console.error(`✗ ${file} — ${action}, error: ${result.error}`);
    }
  }

  console.log(`\nDone: ${files.length - failed} ready, ${failed} failed.`);
  if (failed) {
    console.log("Re-run the command later to retry failed documents.");
  }
  process.exit(failed ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error("Seeding failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
