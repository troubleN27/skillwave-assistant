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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{text}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </main>
  );
}

export const primaryButton =
  "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
export const secondaryButton =
  "rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-900";
