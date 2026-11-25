import {
  BookOpenIcon,
  CircleHelpIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  SearchCheckIcon,
  SettingsIcon,
  UserRoundPlusIcon,
  type LucideIcon,
} from "lucide-react";

/** `key` is the item title in the Admin.nav namespace. */
export type AdminNavItem = { href: string; key: string; icon: LucideIcon };

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/knowledge", key: "knowledge", icon: BookOpenIcon },
  { href: "/admin/search-test", key: "searchTest", icon: SearchCheckIcon },
  { href: "/admin/conversations", key: "conversations", icon: MessagesSquareIcon },
  { href: "/admin/unanswered", key: "unanswered", icon: CircleHelpIcon },
  { href: "/admin/leads", key: "leads", icon: UserRoundPlusIcon },
  { href: "/admin/settings", key: "settings", icon: SettingsIcon },
];
