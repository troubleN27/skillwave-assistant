/** Wordmark: a wave drawn as a rising line — growth of a skill. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#4F46E5" />
        <path
          d="M6 20c3.2 0 3.2-6 6.4-6s3.2 6 6.4 6 3.2-9 6.4-9"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="25.2" cy="11" r="2.4" fill="#06B6D4" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-slate-900">
        Skillwave Academy
      </span>
    </span>
  );
}
