-- Add the Graphic Designer course to the course list used by the lead form,
-- right after UX/UI Designer. Skipped if the course is already in the list.
UPDATE "settings"
SET "courses" = (
  SELECT jsonb_agg(item ORDER BY position, sub)
  FROM (
    SELECT item, position, 0 AS sub
    FROM jsonb_array_elements("settings"."courses") WITH ORDINALITY AS c(item, position)
    UNION ALL
    SELECT
      '{"id": "graphic-design", "name_ru": "Графический дизайнер", "name_en": "Graphic Designer"}'::jsonb,
      COALESCE(
        (SELECT position FROM jsonb_array_elements("settings"."courses") WITH ORDINALITY AS u(item, position) WHERE item->>'id' = 'ux-ui'),
        jsonb_array_length("settings"."courses")
      ),
      1
  ) AS merged
)
WHERE "id" = 1
  AND "courses" IS NOT NULL
  AND NOT "courses" @> '[{"id": "graphic-design"}]'::jsonb;
