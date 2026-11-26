import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAdminLang } from "@/lib/admin/page-lang";
import { requireAdmin } from "@/lib/session";

async function CurrentAdmin() {
  const { user } = await requireAdmin();
  return (
    <div className="min-w-0 px-2 text-sm">
      <p className="truncate font-medium">{user.name}</p>
      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
    </div>
  );
}

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin/[lang]">) {
  await getAdminLang();
  const t = await getTranslations("Admin.common");
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar
          footer={
            <>
              <Suspense fallback={<Skeleton className="mx-2 h-9" />}>
                <CurrentAdmin />
              </Suspense>
              <SignOutButton />
            </>
          }
        />
        <SidebarInset className="min-w-0 bg-sun">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-ink px-4 text-sun md:hidden">
            <SidebarTrigger aria-label={t("openMenu")} />
            <span className="font-display font-black uppercase">Skillwave</span>
          </header>
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  );
}
