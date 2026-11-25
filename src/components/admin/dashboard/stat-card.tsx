export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const numberFormat = new Intl.NumberFormat("ru-RU");

export const formatCount = (value: number) => numberFormat.format(value);

const pluralRules = new Intl.PluralRules("ru-RU");

/** Russian plural: pluralRu(21, ["раз", "раза", "раз"]) → "раз". */
export function pluralRu(n: number, [one, few, many]: [string, string, string]): string {
  const rule = pluralRules.select(n);
  return rule === "one" ? one : rule === "few" ? few : many;
}

export const formatPercent = (value: number | null) =>
  value === null ? "—" : `${value.toLocaleString("ru-RU")}%`;
