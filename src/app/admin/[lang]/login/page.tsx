import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo-mark";
import { LanguageSwitch } from "@/components/admin/language-switch";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminLang } from "@/lib/admin/page-lang";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getAdminLang(), namespace: "Admin.login" });
  return { title: t("title") };
}

export default async function AdminLoginPage() {
  await getAdminLang();
  return <LoginScreen />;
}

function LoginScreen() {
  const t = useTranslations("Admin.login");
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-14" />
          <div>
            <h1 className="font-display text-2xl font-black uppercase">Skillwave Academy</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <LanguageSwitch tone="light" />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
