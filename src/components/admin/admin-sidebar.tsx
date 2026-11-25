"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { adminNavItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavMenu({ pathname }: { pathname: string | null }) {
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
            <span>{item.title}</span>
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
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
            S
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold">Skillwave Academy</p>
            <p className="truncate text-xs text-muted-foreground">
              AI-ассистент
            </p>
          </div>
        </div>
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
