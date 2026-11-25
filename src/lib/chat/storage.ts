"use client";

const VISITOR_KEY = "skillwave:visitorId";
const CONVERSATION_KEY = "skillwave:conversationId";

// Without storage (private mode, blocked cookies) ids live for the page lifetime.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: keep the in-memory copy.
  }
}

const isVisitorId = (v: string | null): v is string => !!v && /^[A-Za-z0-9_-]{8,64}$/.test(v);
const isUuid = (v: string | null): v is string =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export function getVisitorId(): string {
  const existing = read(VISITOR_KEY);
  if (isVisitorId(existing)) return existing;
  const id = `v_${crypto.randomUUID().replace(/-/g, "")}`;
  write(VISITOR_KEY, id);
  return id;
}

export function getConversationId(): string {
  const existing = read(CONVERSATION_KEY);
  if (isUuid(existing)) return existing;
  return startNewConversation();
}

export function startNewConversation(): string {
  const id = crypto.randomUUID();
  write(CONVERSATION_KEY, id);
  return id;
}
