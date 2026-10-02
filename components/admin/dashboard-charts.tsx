"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Database } from "@/lib/types"
import { dailySeries, topProducts } from "@/lib/reports"

const config = {
  generated: { label: "Generadas", color: "var(--chart-1)" },
  redeemed: { label: "Canjeadas", color: "var(--chart-2)" },
} satisfies ChartConfig

export function DashboardCharts({ db }: { db: Database }) {
  const series = dailySeries(db, 14)
  const products = topProducts(db, 5)
  const generated = series.reduce((s, p) => s + p.generated, 0)
  const redeemed = series.reduce((s, p) => s + p.redeemed, 0)
  const conversion = generated ? Math.round((redeemed / generated) * 100) : 0

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-5">
      <section aria-labelledby="trend" className="flex flex-col gap-4 rounded-xl border bg-card p-5 lg:col-span-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="trend" className="font-semibold">
            Ofertas vs. canjes · 14 días
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{conversion}%</span> de conversión
          </p>
        </div>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fill-generated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-generated)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-generated)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fill-redeemed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-redeemed)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-redeemed)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="generated"
              type="monotone"
              stroke="var(--color-generated)"
              strokeWidth={2}
              fill="url(#fill-generated)"
            />
            <Area
              dataKey="redeemed"
              type="monotone"
              stroke="var(--color-redeemed)"
              strokeWidth={2}
              fill="url(#fill-redeemed)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </section>

      <section aria-labelledby="top-products" className="flex flex-col gap-4 rounded-xl border bg-card p-5 lg:col-span-2">
        <h2 id="top-products" className="font-semibold">
          Productos con más ofertas
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay ofertas registradas.</p>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-64 w-full">
            <BarChart data={products} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={150}
                tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
              />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="generated" fill="var(--color-generated)" radius={4} />
              <Bar dataKey="redeemed" fill="var(--color-redeemed)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </section>
    </div>
  )
}
