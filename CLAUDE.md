# Skillwave Academy — AI-ассистент на базе знаний (RAG)

@AGENTS.md

Чат-ассистент для сайта онлайн-школы: отвечает только по базе знаний, показывает источники, собирает заявки. Требования — [docs/PRD.md](docs/PRD.md), техническая спецификация — [docs/SPEC.md](docs/SPEC.md).

## Правила работы

- Работать **строго по этапам раздела 12 SPEC**, по одному. План — только для текущего этапа. Следующий этап — только по команде.
- После этапа: `npm run build`, `npm run lint`, `npm test` → сверка с «Готово, когда» → git-коммит `stage N: …` → короткий отчёт → «Этап N завершён. Перейти к Этапу N+1?».
- Не добавлять функций вне SPEC и ничего из раздела 9 PRD. Новые библиотеки (кроме перечисленных в SPEC §1) — только по согласованию.
- Неясность или противоречие SPEC/PRD — спросить, не додумывать.
- Секреты только в `.env.local` (в `.gitignore`), не выводить их в чат и не коммитить.
- Тексты сайта, виджета и базы знаний — как для действующей школы, без пометок «демо», «пример», «тестовый».
- Код, коммиты и комментарии — на английском; тексты интерфейса — через `messages/*.json` (сайт, виджет) или на русском в админке.

## Стек

Next.js 16 (App Router, `cacheComponents`, `src/proxy.ts` вместо middleware) · TypeScript · Tailwind CSS 4 + shadcn/ui (Base UI) · next-intl · Neon Postgres + pgvector · Drizzle ORM (`neon-serverless`, WebSocket Pool) · Better Auth · Vitest.

## Структура

```
docs/                 PRD и SPEC
db/migrations/        SQL-миграции drizzle-kit (0000 — pgvector, 0002 — настройки по умолчанию, 0003/0004 — порог и контакты)
messages/             переводы сайта и виджета (ru, en)
knowledge/            стартовая база знаний (Markdown; заголовок `#` = название документа, `-en.md` = английский)
evals/questions.json  тестовые вопросы: answerable (ожидаемые документы), noAnswer, offTopic
scripts/              CLI: create-admin, seed-knowledge, eval-retrieval
src/proxy.ts          локали next-intl + быстрая проверка cookie для /admin
src/i18n/             routing, request config, navigation
src/app/[locale]/     сайт школы
src/app/admin/        админка: login/ и (panel)/ с боковым меню
src/app/api/          route handlers: chat, feedback, auth/[...all], admin/blob-upload (токены загрузки в Vercel Blob)
src/db/               schema.ts, client.ts (createDb для скриптов), index.ts (db для приложения)
src/lib/              auth*, session.ts (requireAdmin), settings.ts (настройки, isAllowedOrigin), rate-limit.ts, language.ts, validations/
src/lib/ai/           models.ts (модели из env), embeddings.ts, prompts.ts (системный промпт, заготовки), rewrite.ts
src/lib/chat/         conversations.ts, feedback.ts, types.ts (ChatUIMessage и data-части потока)
src/lib/rag/          file-types, extract, chunking, ingest, documents, retrieve, rrf
src/components/ui/    компоненты shadcn/ui
src/components/admin/ компоненты админки
tests/                Vitest
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | локальный сервер на http://localhost:3000 |
| `npm run build` / `npm run lint` / `npm test` | сборка, ESLint, Vitest |
| `npm run typecheck` | проверка типов |
| `npm run db:generate` | сгенерировать миграцию из `src/db/schema.ts` |
| `npx drizzle-kit generate --custom --name=<name>` | пустая миграция для ручного SQL |
| `npm run db:migrate` | применить миграции |
| `npm run create-admin -- --email <email> --password <password> [--name "<имя>"]` | создать администратора |
| `npm run seed:knowledge [-- --force]` | проиндексировать `knowledge/` (неизменённые документы пропускаются) |
| `npm run eval [-- --threshold 0.xx]` | качество поиска: hit@5, отсечение порогом, рекомендуемый порог |

## Важные детали

- Proxy проверяет только наличие cookie; сессию на сервере проверяют `requireAdmin()` (`src/lib/session.ts`) и каждый Server Action / Route Handler.
- С `cacheComponents` чтение сессии и данных — только внутри `<Suspense>`. На страницах админки заголовок статичный, а данные оборачиваются в `<AdminGate>` (`src/components/admin/admin-gate.tsx`) — иначе dev-проверка мгновенной навигации выдаёт «uncached data outside of Suspense». `requireAdmin` намеренно без React `cache()` (общий промис из макета ломает эту проверку).
- Индексация из админки запускается через `after()` в Server Action; статус обновляется клиентским поллингом `router.refresh()`.
- Файлы базы знаний грузятся из браузера прямо в Vercel Blob (private, `upload()` + `/api/admin/blob-upload`): лимит тела запроса Vercel 4.5 МБ, файлы до 10 МБ. Текст извлекается при первой индексации.
- `mammoth`/`unpdf` импортируются только на сервере (`extract.ts`); клиент использует `file-types.ts`.
- Бесплатный тариф Gemini ограничивает запросы в минуту: при 429 повтор учитывает `retryDelay` из ответа (до 60 с, до 3 повторов).
- Модель ответов — `gemini-3.5-flash-lite` (решение владельца: `gemini-3.8-flash` отвечала 503 «high demand»). Меняется через `GEMINI_CHAT_MODEL`.
- `/api/chat` принимает `{ id (uuid диалога), visitorId, text, locale, pageUrl? }` и сам грузит историю из БД. Ответ — UI message stream AI SDK 7, который маршрут пишет вручную (`createUIMessageStream`): текст + `data-sources`, `data-meta` (id сообщения для 👍/👎, answered), `data-lead-form` (reason, courseId). Типы — `src/lib/chat/types.ts`.
- Форма заявки: инструмент `show_lead_form` + страховка `suggestsLeadForm()` (лёгкая модель иногда предлагает оставить контакты, не вызывая инструмент).
- Порог уверенности 0.69 подобран `npm run eval` с запасом 0.02. Вопросы «без ответа», близкие к теме школы, порог не отсекает — их обрабатывает промпт (в `unanswered_questions` они не пишутся, только после 👎).
- Вызовы модели ограничены по времени: переформулировка 8 с, генерация 45 с; при ошибке — заготовка «перегружен» + форма заявки.
- Колонка `chunks.tsv` генерируется Postgres; индексы HNSW (`vector_cosine_ops`) и GIN описаны в схеме.
- Neon: проект `skillwave-assistant` (aws-eu-central-1), ветка `dev` для разработки.
- Vercel: проект `skillwave-assistant` (без деплоя), Blob store `skillwave-knowledge` (private, fra1).
