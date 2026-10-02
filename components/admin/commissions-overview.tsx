"use client"

import Link from "next/link"
import { useAdmin } from "@/hooks/use-promoter"
import { leaderboard } from "@/lib/commissions"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { StatTile } from "@/components/app/stat-tile"
import { ExportButton } from "@/components/app/export-button"
import { LeaderboardTable } from "@/components/commissions/leaderboard-table"

export function CommissionsOverview() {
  const ctx = useAdmin()
  if (!ctx) return null
  const { db } = ctx
  const { currency, commissionRate, dailyGoal, weeklyGoal } = db.settings
  const rows = leaderboard(db)
  const total = (pick: (r: (typeof rows)[number]) => number) => rows.reduce((s, r) => s + pick(r), 0)
  const atGoal = rows.filter((r) => r.redeemedWeek >= weeklyGoal).length

  return (
    <>
      <PageHeader
        title="Comisiones"
        description={`${commissionRate}% del precio final por canje · Meta diaria ${dailyGoal} · Meta semanal ${weeklyGoal}`}
        actions={
          <>
            <ExportButton
              rows={rows}
              filename="comisiones"
              columns={[
                { header: "Promotor", value: (r) => r.promoter.name },
                { header: "Código", value: (r) => r.promoter.code },
                { header: "Ofertas generadas", value: (r) => r.generated },
                { header: "Canjes hoy", value: (r) => r.redeemedToday },
                { header: "Canjes semana", value: (r) => r.redeemedWeek },
                { header: "Canjes total", value: (r) => r.redeemedTotal },
                { header: "Conversión %", value: (r) => Math.round(r.conversion * 100) },
                { header: "Comisión hoy", value: (r) => r.earnedToday.toFixed(2) },
                { header: "Comisión semana", value: (r) => r.earnedWeek.toFixed(2) },
                { header: "Comisión total", value: (r) => r.earnedTotal.toFixed(2) },
                { header: "Meta semanal", value: (r) => (r.redeemedWeek >= weeklyGoal ? "Cumplida" : "Pendiente") },
              ]}
            />
            <Button variant="outline" render={<Link href="/admin/configuracion" />} nativeButton={false}>
              Ajustar reglas
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="A pagar hoy" value={formatMoney(total((r) => r.earnedToday), currency)} />
        <StatTile label="A pagar semana" value={formatMoney(total((r) => r.earnedWeek), currency)} />
        <StatTile label="Canjes semana" value={total((r) => r.redeemedWeek)} />
        <StatTile label="En meta semanal" value={`${atGoal}/${rows.length}`} hint="Promotores" />
      </div>

      <section className="mt-8 flex flex-col gap-3" aria-labelledby="admin-ranking">
        <h2 id="admin-ranking" className="text-lg font-semibold">
          Ranking semanal
        </h2>
        <LeaderboardTable rows={rows} currency={currency} weeklyGoal={weeklyGoal} showTotals />
      </section>
    </>
  )
}
