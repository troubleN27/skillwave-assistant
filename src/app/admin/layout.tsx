import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Админ-панель — Skillwave Academy",
    template: "%s — Skillwave Academy",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-muted">{children}</body>
    </html>
  );
}
