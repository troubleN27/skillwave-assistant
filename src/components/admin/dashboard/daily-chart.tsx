"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { adminIntlLocale, parseAdminLang } from "@/lib/admin/locale";

// Blue and ochre: both keep 3:1 contrast on white and the pair passes the
// dataviz palette validator (CVD ΔE 26.9, normal vision ΔE 30.6). Brand black
// can't be a series colour: the validator rejects it as too dark and grey.
const COLORS = { conversations: "#1D6FD1", leads: "#B45309" };

type Point = { day: string; conversations: number; leads: number };

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);

export function DailyChart({ data }: { data: Point[] }) {
  const t = useTranslations("Admin.dashboard");
  const intlLocale = adminIntlLocale(parseAdminLang(useLocale()));
  const { config, shortDate, longDate } = useMemo(
    () => ({
      config: {
        conversations: { label: t("series.conversations"), color: COLORS.conversations },
        leads: { label: t("series.leads"), color: COLORS.leads },
      } satisfies ChartConfig,
      shortDate: new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", timeZone: "UTC" }),
      longDate: new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    }),
    [t, intlLocale],
  );
  const empty = data.every((p) => p.conversations === 0 && p.leads === 0);

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer
        config={config}
        className="aspect-auto h-64 w-full"
        role="img"
        aria-label={t("dailyTitle")}
      >
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(day: string) => shortDate.format(toDate(day))}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
          <ChartTooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const day = payload?.[0]?.payload?.day as string | undefined;
                  return day ? longDate.format(toDate(day)) : "";
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="conversations"
            type="linear"
            stroke="var(--color-conversations)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            dataKey="leads"
            type="linear"
            stroke="var(--color-leads)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
      {empty && (
        <p className="text-center text-sm text-muted-foreground">
          {t("chartEmpty")}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          {t("showTable")}
        </summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border">
          <table className="w-full text-left tabular-nums">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-1.5 font-medium">{t("date")}</th>
                <th className="px-3 py-1.5 text-right font-medium">{t("series.conversations")}</th>
                <th className="px-3 py-1.5 text-right font-medium">{t("series.leads")}</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((p) => (
                <tr key={p.day} className="border-t">
                  <td className="px-3 py-1">{longDate.format(toDate(p.day))}</td>
                  <td className="px-3 py-1 text-right">{p.conversations}</td>
                  <td className="px-3 py-1 text-right">{p.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
