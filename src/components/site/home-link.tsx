"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { scrollToTop } from "@/lib/scroll-top";

/** The logo link: on the home page it scrolls back to the top instead of reloading the page. */
export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      className={className}
      onClick={(event) => {
        if (pathname !== "/") return;
        event.preventDefault();
        scrollToTop();
      }}
    >
      {children}
    </Link>
  );
}
