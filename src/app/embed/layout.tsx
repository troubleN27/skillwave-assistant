import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Skillwave Academy",
  robots: { index: false, follow: false },
};

/** Root layout for the chat shown inside an iframe on other websites. */
export default function EmbedLayout({ children }: LayoutProps<"/embed">) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-white text-slate-900">{children}</body>
    </html>
  );
}
