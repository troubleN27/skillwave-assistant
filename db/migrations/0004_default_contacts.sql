-- Confidence threshold chosen with `npm run eval` (see README) and school
-- contacts for "contact us" answers; values match knowledge/about.md.
UPDATE "settings"
SET
  "min_similarity" = 0.69,
  "contacts_ru" = 'Email: hello@skillwave.academy
Телефон: +7 800 555-27-41 (бесплатно по России)
Telegram: @skillwave_academy
Менеджеры работают с понедельника по пятницу, 10:00–19:00 по московскому времени.',
  "contacts_en" = 'Email: hello@skillwave.academy
Phone: +7 800 555-27-41
Telegram: @skillwave_academy
Managers are available Monday to Friday, 10 am – 7 pm Moscow time.'
WHERE "id" = 1;
