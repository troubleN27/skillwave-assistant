ALTER TABLE "settings" ALTER COLUMN "min_similarity" SET DEFAULT 0.68;--> statement-breakpoint
-- After the English knowledge base was added, npm run eval recommends 0.68
-- (a 0.02 margin for answerable questions). Only move the old default;
-- a threshold the owner changed in the admin panel is left alone.
UPDATE "settings" SET "min_similarity" = 0.68 WHERE round("min_similarity"::numeric, 2) = 0.69;
