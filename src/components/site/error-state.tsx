import type { ReactNode } from "react";
import { Logo } from "./logo";

/** Centered message used by the site's error and not-found pages. */
export function ErrorState({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Logo />
      <div className="max-w-md">
        <h1 className="font-display text-4xl font-black uppercase">{title}</h1>
        <p className="mt-3 text-ink-soft">{text}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </main>
  );
}

export const primaryButton =
  "inline-flex h-12 items-center bg-ink px-6 text-sm font-bold text-sun transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
export const secondaryButton =
  "inline-flex h-12 items-center border-2 border-ink px-6 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-sun focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
