import { adminIntlLocale, type AdminLang } from "@/lib/admin/locale";

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const formatCount = (value: number, lang: AdminLang) =>
  new Intl.NumberFormat(adminIntlLocale(lang)).format(value);

export const formatPercent = (value: number | null, lang: AdminLang) =>
  value === null ? "—" : `${value.toLocaleString(adminIntlLocale(lang))}%`;
