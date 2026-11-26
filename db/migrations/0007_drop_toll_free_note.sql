-- The school phone number is no longer described as toll-free.
UPDATE "settings"
SET "contacts_ru" = replace("contacts_ru", ' (бесплатно по России)', '')
WHERE "id" = 1 AND "contacts_ru" LIKE '%(бесплатно по России)%';
