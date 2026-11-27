-- The assistant name becomes per-language, like the greeting and quick questions.
ALTER TABLE "settings" RENAME COLUMN "assistant_name" TO "assistant_name_ru";--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "assistant_name_en" text NOT NULL DEFAULT 'Skillwave Assistant';--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "assistant_name_en" DROP DEFAULT;
