"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo-mark";
import { Suspense, type ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LanguageSwitch } from "./language-switch";
import { adminNavItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavMenu({ pathname }: { pathname: string | null }) {
  const t = useTranslations("Admin.nav");
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {adminNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={pathname !== null && isActive(pathname, item.href)}
            render={<Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} />}
          >
            <item.icon />
            <span>{t(item.key)}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function ActiveNavMenu() {
  return <NavMenu pathname={usePathname()} />;
}

export function AdminSidebar({ footer }: { footer: ReactNode }) {
  const t = useTranslations("Admin.nav");
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <LogoMark inverted className="size-9" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display font-black uppercase">Skillwave</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{t("subtitle")}</p>
          </div>
        </div>
        <LanguageSwitch className="mx-2 mt-1" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* usePathname() is request data on dynamic routes: highlight after it streams in. */}
            <Suspense fallback={<NavMenu pathname={null} />}>
              <ActiveNavMenu />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
    </Sidebar>
  );
}
