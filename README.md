# Skillwave Academy — AI-ассистент

AI-ассистент для сайта онлайн-школы цифровых профессий Skillwave Academy. Круглосуточно отвечает посетителям на вопросы о курсах, ценах, расписании, оплате, возвратах и сертификатах — только по базе знаний школы и со ссылками на источники. Если ответа в базе нет, честно говорит об этом и предлагает оставить заявку менеджеру.

Состав:

- **Сайт школы** (`/ru`, `/en`) — витрина курсов, на которой работает ассистент.
- **Чат-виджет** — встроен в сайт и подключается к другим сайтам одной строкой кода.
- **Админ-панель** (`/admin`) — база знаний, диалоги, заявки, аналитика, настройки.
- **Уведомления в Telegram** — менеджеру о новых заявках.

Подробные требования — [docs/PRD.md](docs/PRD.md), техническая спецификация — [docs/SPEC.md](docs/SPEC.md).

## Стек

- Next.js 16 (App Router, TypeScript), Tailwind CSS 4, shadcn/ui, lucide-react
- next-intl — русский и английский
- Neon (PostgreSQL) + pgvector, Drizzle ORM и drizzle-kit
- Better Auth — вход в админку по email и паролю
- Gemini API через Vercel AI SDK
- Vitest

## Запуск локально

Нужны Node.js 20+ и база Neon с поддержкой расширения `vector`.

```powershell
npm install
Copy-Item .env.example .env.local
```

Заполните в `.env.local` как минимум `DATABASE_URL` (pooled-строка Neon), `DATABASE_URL_UNPOOLED` (прямая строка, для миграций) и `BETTER_AUTH_SECRET`. Секрет можно сгенерировать так:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Примените миграции, создайте администратора и запустите сервер:

```powershell
npm run db:migrate
```

```powershell
npm run create-admin -- --email admin@skillwave.academy --password "надёжный-пароль"
```

```powershell
npm run dev
```

Сайт: http://localhost:3000, админ-панель: http://localhost:3000/admin.

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | сервер разработки |
| `npm run build` | production-сборка |
| `npm run lint` | ESLint |
| `npm test` | тесты Vitest |
| `npm run typecheck` | проверка типов TypeScript |
| `npm run db:generate` | создать миграцию по изменениям `src/db/schema.ts` |
| `npm run db:migrate` | применить миграции к базе |
| `npm run db:studio` | Drizzle Studio |
| `npm run create-admin -- --email … --password …` | создать администратора (пароль от 8 символов) |

## База данных

Схема описана в `src/db/schema.ts`, миграции лежат в `db/migrations/`:

- `0000_enable_pgvector` — расширение `vector`;
- `0001_initial_schema` — таблицы, индексы HNSW (векторный поиск) и GIN (полнотекстовый поиск), генерируемая колонка `chunks.tsv`;
- `0002_default_settings` — настройки ассистента по умолчанию.

Регистрация в админке отключена: администраторы создаются только командой `create-admin`.

## Переменные окружения

Полный список с пояснениями — в [.env.example](.env.example). Ключи API используются только на сервере и не попадают в браузер.
