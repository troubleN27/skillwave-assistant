import { FileTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { AskButton } from "./ask-button";

/** The assistant is the product, so the hero shows a real exchange with it. */
export function Hero() {
  const t = useTranslations("Site.hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <h1 className="max-w-[18ch] text-[2.1rem] leading-[1.08] font-bold tracking-[-0.03em] text-balance text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-slate-600 sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AskButton className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {t("cta")}
            </AskButton>
            <a
              href="#courses"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-900"
            >
              {t("secondary")}
            </a>
          </div>
        </div>

        <figure className="relative">
          {/* A wave of the brand accent behind the conversation. */}
          <svg
            viewBox="0 0 400 120"
            className="absolute -top-10 -right-24 w-[140%] max-w-none text-cyan-500/15"
            aria-hidden
          >
            <path
              d="M0 80 C 60 20, 120 20, 180 70 S 300 120, 400 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="28"
              strokeLinecap="round"
            />
          </svg>
          <div className="relative rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)] sm:p-5">
            <figcaption className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-cyan-500" aria-hidden />
              {t("chatPreview")}
            </figcaption>
            <div className="space-y-3 text-sm leading-relaxed">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-3.5 py-2 text-white">
                {t("chatQuestion")}
              </p>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-slate-900">
                <ChatMarkdown text={t("chatAnswer")} />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 px-2 py-0.5 text-[11px] text-slate-600">
                <FileTextIcon className="size-3 text-cyan-600" aria-hidden />
                {t("chatSource")}
              </span>
            </div>
            <AskButton className="mt-5 w-full rounded-2xl border border-dashed border-indigo-300 px-4 py-3 text-left text-sm text-indigo-700 transition-colors hover:border-indigo-500 hover:bg-indigo-50">
              {t("chatTry")}
            </AskButton>
          </div>
        </figure>
      </div>
    </section>
  );
}
