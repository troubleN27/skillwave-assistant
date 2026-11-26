"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { adminIntlLocale, parseAdminLang } from "@/lib/admin/locale";

// The chart sits on a black card in the site colours: brand yellow (solid) and
// orange (dashed). On #121110 the pair passes the dataviz validator for colour
// blindness (ΔE 24.6) and contrast; it misses only the lightness band because
// the brand yellow is so light, so the series also differ by dash and carry
// direct labels.
const COLORS = { conversations: "#FFFF00", leads: "#FF6B35" };

type Point = { day: string; conversations: number; leads: number };

/** Names a series right after its last point, so the lines don't rely on colour alone. */
function endLabel(text: string, color: string, count: number) {
  // recharts passes loosely typed label props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function EndLabel(props: any) {
    if (props.index !== count - 1) return null;
    return (
      <text x={Number(props.x) + 8} y={Number(props.y) + 4} fill={color} fontSize={12} fontWeight={700}>
        {text}
      </text>
    );
  };
}

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
        className="aspect-auto h-64 w-full [&_.recharts-cartesian-axis-tick_text]:fill-[#d8d4c4] [&_.recharts-legend-item-text]:text-[#f4ecd0]"
        role="img"
        aria-label={t("dailyTitle")}
      >
        <LineChart data={data} margin={{ top: 18, right: 72, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="rgba(244,236,208,0.14)" />
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
            cursor={{ stroke: "rgba(244,236,208,0.5)", strokeWidth: 1 }}
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
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          >
            <LabelList dataKey="conversations" content={endLabel(config.conversations.label, COLORS.conversations, data.length)} />
          </Line>
          <Line
            dataKey="leads"
            type="linear"
            stroke="var(--color-leads)"
            strokeWidth={2.5}
            strokeDasharray="7 5"
            dot={false}
            activeDot={{ r: 4 }}
          >
            <LabelList dataKey="leads" content={endLabel(config.leads.label, COLORS.leads, data.length)} />
          </Line>
        </LineChart>
      </ChartContainer>
      {empty && (
        <p className="text-center text-sm text-muted-foreground">
          {t("chartEmpty")}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-[#d8d4c4] hover:text-sun">
          {t("showTable")}
        </summary>
        <div className="mt-2 max-h-64 overflow-auto border-2 border-sun bg-white text-ink">
          <table className="w-full text-left tabular-nums">
            <thead className="sticky top-0 bg-sun">
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
