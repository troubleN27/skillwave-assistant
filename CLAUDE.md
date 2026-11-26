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
- Код, коммиты и комментарии — на английском; тексты интерфейса — только через `messages/*.json` (разделы `Site`, `Widget`, `LeadForm`, `Admin` и др.), в коде их не пишем.

## Стек

Next.js 16 (App Router, `cacheComponents`, `src/proxy.ts` вместо middleware) · TypeScript · Tailwind CSS 4 + shadcn/ui (Base UI) · next-intl · GSAP + `@gsap/react` · Neon Postgres + pgvector · Drizzle ORM (`neon-serverless`, WebSocket Pool) · Better Auth · Vitest.

## Структура

```
docs/                 PRD и SPEC
db/migrations/        SQL-миграции drizzle-kit (0000 — pgvector, 0002 — настройки по умолчанию, 0003/0004 — порог и контакты, 0005 — порог 0.68, 0006 — курс «Графический дизайнер» в форме заявки, 0007 — телефон без «бесплатно по России»)
messages/             переводы сайта, виджета и админки (ru, en)
knowledge/            база знаний (Markdown, 13 документов × RU/EN, 6 курсов; заголовок `#` = название, `-en.md` = английский)
public/images/        портреты преподавателей (фон выровнен под #FFFF00), аэрозольная краска spray-edge.png / spray-splat.png (прозрачные PNG цвета #121110)
evals/questions.json  тестовые вопросы: answerable (ожидаемые документы), noAnswer, offTopic
scripts/              CLI: create-admin, seed-knowledge, eval-retrieval
src/proxy.ts          локали next-intl; /admin: проверка cookie сессии и переписывание на /admin/{lang} по cookie admin_lang
src/i18n/             routing, request config, navigation
src/app/[locale]/     сайт школы
src/app/admin/[lang]/ админка (ru, en): login/ и (panel)/ с боковым меню
src/app/embed/        чат для iframe: /embed?lang= → proxy переписывает на статическую /embed/[lang]
src/app/api/          route handlers: chat, chat/history, feedback, leads, auth/[...all], admin/blob-upload
public/widget.js      скрипт встраивания (без зависимостей), кнопка — логотип (встроенный SVG); public/embed-test.html — проверка
src/components/chat/  виджет: chat-widget (сайт), embedded-chat (iframe), chat-panel, chat-session (useChat), lead-form
src/components/site/  разделы сайта, ink.tsx (InkSplat — клякса, InkEdge — край под шапкой / над подвалом), hero-receipt (чек), starts/starts-board (табло стартов), certificate, chat-replies, week-planner (учебная неделя), home-link, motion-root (GSAP), lead-dialog; данные курсов — src/lib/site/courses.ts (тесты сверяют сайт с knowledge/)
src/components/brand/ логотип (LogoMark — знак на кляксе), печать (Stamp), splat-paths.ts (контуры клякс, сгенерированы один раз)
src/db/               schema.ts, client.ts (createDb для скриптов), index.ts (db для приложения)
src/lib/              auth*, session.ts (requireAdmin), settings.ts (настройки, isAllowedOrigin), rate-limit.ts, language.ts, validations/
src/lib/ai/           models.ts (модели из env), embeddings.ts, prompts.ts (системный промпт, заготовки), rewrite.ts
src/lib/chat/         conversations.ts, feedback.ts, types.ts (ChatUIMessage и data-части потока)
src/lib/admin/        period (7/30/90 дней, московское время), analytics, conversations, unanswered (группировка), leads; locale/page-lang/i18n/action-result — язык админки
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
- Порог уверенности 0.68 подобран `npm run eval` с запасом 0.02 (после добавления английских документов; миграция 0005). Вопросы «без ответа», близкие к теме школы, порог не отсекает — их обрабатывает промпт (в `unanswered_questions` они не пишутся, только после 👎).
- Вызовы модели ограничены по времени: переформулировка 8 с, генерация 45 с; при ошибке — заготовка «перегружен» + форма заявки.
- Виджет: `visitorId`/`conversationId` в localStorage (`src/lib/chat/storage.ts`), история — `GET /api/chat/history`. Сессия чата (`ChatSession`) пересоздаётся по `key={conversationId}`; форма заявки вычисляется из `data-lead-form` последнего ответа (без setState в эффектах — правило React Compiler).
- Настройки для виджета — `getWidgetConfig()` с `"use cache"` + `cacheTag("settings")`; Server Action сохранения настроек вызывает `updateTag("settings")`.
- Страницы ошибок: `error.tsx` (проп `retry` в Next 16) для сайта, `/embed` и админки; `not-found.tsx` сайта (RU/EN) и админки; `[locale]/[...rest]` отдаёт локализованный 404.
- Системный промпт требует копировать цены, даты и контакты из контекста дословно; устойчивость к инъекциям (в т.ч. внутри документов) проверена на Этапе 6.
- Язык ответа определяет сервер (`detectLanguage`) и явно передаёт в системный промпт.
- `/embed`: CSP `frame-ancestors 'self' <allowed_origins>` ставит `src/proxy.ts` (кэш 60 с). Страница вызывает `setRequestLocale`, иначе next-intl читает заголовки и ломает статическую отрисовку; `instant = false`, т.к. клиентской навигации в iframe нет.
- Заявки: `/api/leads` (zod, honeypot `website`, 3/час на посетителя и 10/час на IP) → Telegram в `after()`; без токена — пропуск с логом. Лимиты чата: 20/10 мин на посетителя+IP, 60/10 мин на IP, диалог и сутки — из settings.
- Админка: все даты и дневная разбивка — по Москве (`ADMIN_TIME_ZONE`, `formatDateTime`). Фильтры и вкладки — в `searchParams`, страницы читают их внутри `<AdminGate>`. Меню в сайдбаре — в `<Suspense>` (usePathname на динамических маршрутах).
- Вопросы без ответа группируются по нормализованному тексту (`normalizeQuestion`); «Добавить ответ» создаёт FAQ (`answerWithFaqAction`) и помечает всю группу `resolved`.
- Сохранение настроек вызывает `updateTag("settings")` — виджет видит изменения сразу; правка `settings` напрямую в БД кэш виджета НЕ сбрасывает (только через админку). Лимиты и порог чат читает из БД без кэша.
- График Главной на чёрной карточке: жёлтый `#FFFF00` (сплошная) + оранжевый `#FF6B35` (пунктир) с подписями у линий. Валидатор dataviz: различимость и контраст проходят, полоса яркости — нет (из-за брендового жёлтого), поэтому серии различаются ещё пунктиром и подписями. Таблица данных под графиком.
- Админка: жёлтый фон, белые панели `border-2 border-ink` с тенью, квадратные углы (`--radius: 0`), шапки таблиц чёрные с жёлтым текстом (`.admin-theme` в `globals.css`).
- Колонка `chunks.tsv` генерируется Postgres; индексы HNSW (`vector_cosine_ops`) и GIN описаны в схеме.
- Язык админки: cookie `admin_lang` → `src/proxy.ts` переписывает `/admin/...` на статические `/admin/{lang}/...`. Страницы берут язык через `getAdminLang()` (`next/root-params` + `setRequestLocale`), чтобы не ждать динамические params вне Suspense. `loading.tsx` — клиентский компонент, `not-found` и layout панели сами вызывают `getAdminLang()`, а корневой layout импортирует JSON сообщений напрямую: иначе next-intl читает заголовки и ломает пререндер. Server Actions переводят ошибки через `getActionTranslations()` (cookie); ключи ошибок zod — в `Admin.validation`.
- Сайт: стили анимаций лежат в компонентах (inline styles / GSAP), а не в `globals.css` — Turbopack на пути с кириллицей иногда не подхватывает правки CSS без перезапуска dev-сервера, а `npm run build` может взять старый CSS из `.next/cache` (перед сборкой его удалять).
- Кляксы и края (`spray-splat.png`, `spray-edge.png`, краска #121110) — обычные `<img>` с прозрачным PNG; край под шапкой и отражённый над подвалом, у чёрных разделов края ровные, не CSS-маски: маски перерисовываются на каждом кадре анимации.
- Playwright (headless) на страницах сайта и админки отдаёт 1–3 кадра в секунду (в обычном Chrome — 240), поэтому GSAP-анимации там идут в 10+ раз медленнее. Визуальные проверки анимаций — в Chrome (chrome-devtools).
- Анимации сайта — `MotionRoot`: data-атрибуты `data-hero-*`, `data-anim="stamp|splat|deal|tape"`. Кляксы по клику на кнопках нет (убрана по решению владельца). Элементы первого экрана скрыты inline-стилем, CSS-страховка показывает их через 2,5 с. При перезагрузке `MotionRoot` сбрасывает прокрутку и #якорь (`history.scrollRestoration = "manual"`).
- Форма заявки открывается и с сайта (`LeadDialogProvider`, без `conversationId`).
- Источники под ответом — только на языке ответа (`visibleSources`), полный список с языком документа хранится в `messages.sources`.
- Обрыв генерации (ошибка или `abort` по таймауту) после первых слов: пометка `cannedReply("interrupted")`, форма заявки, `answered = null`.
- Neon: проект `skillwave-assistant` (aws-eu-central-1), ветка `dev` для разработки.
- Vercel: проект `skillwave-assistant` (без деплоя), Blob store `skillwave-knowledge` (private, fra1).
