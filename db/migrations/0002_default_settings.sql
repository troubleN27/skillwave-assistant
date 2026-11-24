INSERT INTO "settings" (
  "id",
  "assistant_name",
  "welcome_ru",
  "welcome_en",
  "quick_questions_ru",
  "quick_questions_en",
  "courses",
  "allowed_origins"
) VALUES (
  1,
  'Ассистент Skillwave',
  'Здравствуйте! Я ассистент Skillwave Academy. Помогу выбрать курс и отвечу на вопросы о программе, стоимости, расписании и оплате.',
  'Hi! I''m the Skillwave Academy assistant. I can help you choose a course and answer questions about programs, prices, schedules and payment.',
  '["Какой курс выбрать новичку?", "Есть ли рассрочка?", "Когда старт ближайшего потока?", "Выдаёте ли вы сертификат?"]'::jsonb,
  '["Which course is best for beginners?", "Can I pay in installments?", "When does the next cohort start?", "Do you issue a certificate?"]'::jsonb,
  '[
    {"id": "frontend", "name_ru": "Frontend-разработчик", "name_en": "Frontend Developer"},
    {"id": "ux-ui", "name_ru": "UX/UI-дизайнер", "name_en": "UX/UI Designer"},
    {"id": "python", "name_ru": "Python-разработчик", "name_en": "Python Developer"},
    {"id": "data-analyst", "name_ru": "Аналитик данных", "name_en": "Data Analyst"},
    {"id": "marketing", "name_ru": "Интернет-маркетолог", "name_en": "Digital Marketer"}
  ]'::jsonb,
  '[]'::jsonb
) ON CONFLICT ("id") DO NOTHING;
