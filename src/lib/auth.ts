import "server-only";
import { db } from "@/db";
import { createAuth } from "@/lib/auth-config";

export const auth = createAuth(db);
