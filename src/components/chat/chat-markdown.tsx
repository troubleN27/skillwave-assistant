import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-semibold text-ink underline underline-offset-2"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  // The assistant is told not to use headings; render them as plain paragraphs.
  h1: ({ children }) => <p className="mt-2 font-semibold">{children}</p>,
  h2: ({ children }) => <p className="mt-2 font-semibold">{children}</p>,
  h3: ({ children }) => <p className="mt-2 font-semibold">{children}</p>,
  code: ({ children }) => (
    <code className="bg-ink/10 px-1 py-0.5 text-[0.85em]">{children}</code>
  ),
  img: () => null,
};

/** Keeps prices like "62 100 ₽" or "7 917 RUB" on one line. */
export function keepNumbersTogether(text: string): string {
  return text
    .replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
    .replace(/(\d) (?=(₽|руб|RUB))/g, "$1 ");
}

/** Assistant answers as Markdown; raw HTML is never rendered (SPEC 6.1). */
export function ChatMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown skipHtml components={components}>
      {keepNumbersTogether(text)}
    </ReactMarkdown>
  );
}
