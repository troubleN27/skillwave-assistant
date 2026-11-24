import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Вход" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            S
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Skillwave Academy
            </h1>
            <p className="text-sm text-muted-foreground">
              Вход в панель управления ассистентом
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
