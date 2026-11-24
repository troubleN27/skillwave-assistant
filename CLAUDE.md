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
db/migrations/        SQL-миграции drizzle-kit (0000 — pgvector, 0002 — настройки по умолчанию)
messages/             переводы сайта и виджета (ru, en)
scripts/              CLI: create-admin (далее seed-knowledge, eval-retrieval)
src/proxy.ts          локали next-intl + быстрая проверка cookie для /admin
src/i18n/             routing, request config, navigation
src/app/[locale]/     сайт школы
src/app/admin/        админка: login/ и (panel)/ с боковым меню
src/app/api/          route handlers (auth/[...all])
src/db/               schema.ts, client.ts (createDb для скриптов), index.ts (db для приложения)
src/lib/              auth-config.ts, auth.ts, auth-client.ts, session.ts (requireAdmin), validations/
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

## Важные детали

- Каждая страница админки вызывает `requireAdmin()` (`src/lib/session.ts`); proxy проверяет только наличие cookie.
- С `cacheComponents` любые обращения к `headers()`/`cookies()` должны быть внутри `<Suspense>` (в админке это обеспечивает `(panel)/loading.tsx`).
- Колонка `chunks.tsv` генерируется Postgres; индексы HNSW (`vector_cosine_ops`) и GIN описаны в схеме.
- Neon: проект `skillwave-assistant` (aws-eu-central-1), ветка `dev` для разработки.
