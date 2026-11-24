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

export type AdminNavItem = { href: string; title: string; icon: LucideIcon };

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", title: "Главная", icon: LayoutDashboardIcon },
  { href: "/admin/knowledge", title: "База знаний", icon: BookOpenIcon },
  { href: "/admin/search-test", title: "Проверка поиска", icon: SearchCheckIcon },
  { href: "/admin/conversations", title: "Диалоги", icon: MessagesSquareIcon },
  { href: "/admin/unanswered", title: "Вопросы без ответа", icon: CircleHelpIcon },
  { href: "/admin/leads", title: "Заявки", icon: UserRoundPlusIcon },
  { href: "/admin/settings", title: "Настройки", icon: SettingsIcon },
];
