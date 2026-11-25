import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

const EMBEDDING_DIMENSIONS = 768;

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export type Course = { id: string; name_ru: string; name_en: string };

export type MessageSource = {
  documentId: string;
  title: string;
  chunkId: string;
  similarity: number;
  /** Document language; missing on messages saved before it was recorded. */
  language?: "ru" | "en";
};

/* ---------- Assistant settings (single row) ---------- */

export const settings = pgTable(
  "settings",
  {
    id: integer("id").primaryKey().default(1),
    assistantName: text("assistant_name").notNull(),
    welcomeRu: text("welcome_ru"),
    welcomeEn: text("welcome_en"),
    quickQuestionsRu: jsonb("quick_questions_ru").$type<string[]>(),
    quickQuestionsEn: jsonb("quick_questions_en").$type<string[]>(),
    contactsRu: text("contacts_ru"),
    contactsEn: text("contacts_en"),
    courses: jsonb("courses").$type<Course[]>(),
    allowedOrigins: jsonb("allowed_origins").$type<string[]>(),
    maxMessagesPerConversation: integer("max_messages_per_conversation")
      .default(30)
      .notNull(),
    maxMessagesPerDay: integer("max_messages_per_day").default(500).notNull(),
    minSimilarity: real("min_similarity").default(0.68).notNull(),
    telegramNotifications: boolean("telegram_notifications")
      .default(true)
      .notNull(),
  },
  (t) => [check("settings_single_row", sql`${t.id} = 1`)],
);

/* ---------- Knowledge base ---------- */

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    sourceType: text("source_type", {
      enum: ["pdf", "docx", "txt", "md", "text", "faq"],
    }).notNull(),
    language: text("language", { enum: ["ru", "en"] }).notNull(),
    content: text("content").notNull(),
    fileUrl: text("file_url"),
    status: text("status", { enum: ["processing", "ready", "error"] })
      .default("processing")
      .notNull(),
    error: text("error"),
    chunkCount: integer("chunk_count").default(0).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check(
      "documents_source_type_check",
      sql`${t.sourceType} in ('pdf','docx','txt','md','text','faq')`,
    ),
    check("documents_language_check", sql`${t.language} in ('ru','en')`),
    check(
      "documents_status_check",
      sql`${t.status} in ('processing','ready','error')`,
    ),
  ],
);

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    content: text("content").notNull(),
    heading: text("heading"),
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }).notNull(),
    tsv: tsvector("tsv").generatedAlwaysAs(
      sql`to_tsvector('simple', coalesce(heading, '') || ' ' || content)`,
    ),
  },
  (t) => [
    index("chunks_document_id_idx").on(t.documentId),
    index("chunks_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    index("chunks_tsv_idx").using("gin", t.tsv),
  ],
);

/* ---------- Conversations ---------- */

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorId: text("visitor_id").notNull(),
    locale: text("locale"),
    pageUrl: text("page_url"),
    origin: text("origin"),
    messageCount: integer("message_count").default(0).notNull(),
    hasLead: boolean("has_lead").default(false).notNull(),
    hasUnanswered: boolean("has_unanswered").default(false).notNull(),
    hasNegativeFeedback: boolean("has_negative_feedback")
      .default(false)
      .notNull(),
    createdAt: createdAt(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("conversations_visitor_id_idx").on(t.visitorId),
    index("conversations_created_at_idx").on(t.createdAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    sources: jsonb("sources").$type<MessageSource[]>(),
    answered: boolean("answered"),
    feedback: text("feedback", { enum: ["up", "down"] }),
    latencyMs: integer("latency_ms"),
    createdAt: createdAt(),
  },
  (t) => [
    index("messages_conversation_id_idx").on(t.conversationId, t.createdAt),
    check("messages_role_check", sql`${t.role} in ('user','assistant')`),
    check("messages_feedback_check", sql`${t.feedback} in ('up','down')`),
  ],
);

export const unansweredQuestions = pgTable(
  "unanswered_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id").references(() => messages.id, {
      onDelete: "cascade",
    }),
    question: text("question").notNull(),
    reason: text("reason", {
      enum: ["no_context", "negative_feedback"],
    }).notNull(),
    status: text("status", { enum: ["new", "resolved", "ignored"] })
      .default("new")
      .notNull(),
    resolvedDocumentId: uuid("resolved_document_id").references(
      () => documents.id,
      { onDelete: "set null" },
    ),
    createdAt: createdAt(),
  },
  (t) => [
    index("unanswered_questions_status_idx").on(t.status, t.createdAt),
    check(
      "unanswered_questions_reason_check",
      sql`${t.reason} in ('no_context','negative_feedback')`,
    ),
    check(
      "unanswered_questions_status_check",
      sql`${t.status} in ('new','resolved','ignored')`,
    ),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(
      () => conversations.id,
      { onDelete: "set null" },
    ),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    courseId: text("course_id"),
    preferredChannel: text("preferred_channel", {
      enum: ["call", "telegram", "email"],
    }),
    comment: text("comment"),
    status: text("status", { enum: ["new", "in_progress", "closed"] })
      .default("new")
      .notNull(),
    managerNote: text("manager_note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("leads_created_at_idx").on(t.createdAt),
    check(
      "leads_preferred_channel_check",
      sql`${t.preferredChannel} in ('call','telegram','email')`,
    ),
    check(
      "leads_status_check",
      sql`${t.status} in ('new','in_progress','closed')`,
    ),
  ],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

/* ---------- Better Auth ---------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);
