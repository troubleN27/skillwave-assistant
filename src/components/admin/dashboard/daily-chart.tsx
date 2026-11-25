"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Brand indigo and a darker cyan step (#0891B2) that keeps 3:1 contrast on white;
// the pair passes the dataviz palette validator (CVD ΔE ≥ 12).
const config = {
  conversations: { label: "Диалоги", color: "#4F46E5" },
  leads: { label: "Заявки", color: "#0891B2" },
} satisfies ChartConfig;

type Point = { day: string; conversations: number; leads: number };

const shortDate = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const toDate = (day: string) => new Date(`${day}T00:00:00Z`);

export function DailyChart({ data }: { data: Point[] }) {
  const empty = data.every((p) => p.conversations === 0 && p.leads === 0);

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer
        config={config}
        className="aspect-auto h-64 w-full"
        role="img"
        aria-label="Диалоги и заявки по дням"
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
          За выбранный период диалогов и заявок не было.
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Показать таблицей
        </summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border">
          <table className="w-full text-left tabular-nums">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-1.5 font-medium">Дата</th>
                <th className="px-3 py-1.5 text-right font-medium">Диалоги</th>
                <th className="px-3 py-1.5 text-right font-medium">Заявки</th>
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
