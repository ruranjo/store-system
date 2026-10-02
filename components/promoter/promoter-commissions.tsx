"use client"

import { Wallet } from "lucide-react"
import { usePromoter } from "@/hooks/use-promoter"
import { earningsFor, leaderboard, offerCommission, recentRedemptions } from "@/lib/commissions"
import { discountedPrice } from "@/lib/offers"
import { formatDateTime, formatMoney } from "@/lib/format"
import { PageHeader } from "@/components/app/page-header"
import { StatTile } from "@/components/app/stat-tile"
import { EmptyState } from "@/components/app/empty-state"
import { GoalProgress } from "@/components/commissions/goal-progress"
import { LeaderboardTable } from "@/components/commissions/leaderboard-table"

export function PromoterCommissions() {
  const ctx = usePromoter()
  if (!ctx) return null
  const { db, promoter } = ctx
  const { currency, commissionRate, dailyGoal, weeklyGoal } = db.settings
  const me = earningsFor(db, promoter)
  const ranking = leaderboard(db)
  const position = ranking.findIndex((r) => r.promoter.id === promoter.id) + 1
  const recent = recentRedemptions(db, promoter.id)

  return (
    <>
      <PageHeader
        title="Comisiones y metas"
        description={`Ganas ${commissionRate}% del precio final por cada código tuyo que se canjea en tienda.`}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <GoalProgress label="Meta de hoy" current={me.redeemedToday} goal={dailyGoal} />
        <GoalProgress label="Meta de la semana" current={me.redeemedWeek} goal={weeklyGoal} hint="Reinicia el lunes" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Ganado hoy" value={formatMoney(me.earnedToday, currency)} />
        <StatTile label="Esta semana" value={formatMoney(me.earnedWeek, currency)} />
        <StatTile label="Acumulado" value={formatMoney(me.earnedTotal, currency)} hint={`${me.redeemedTotal} canjes`} />
        <StatTile
          label="Ranking"
          value={position ? `#${position}` : "—"}
          hint={`De ${ranking.length} promotores`}
        />
      </div>

      <section className="mt-8 flex flex-col gap-3" aria-labelledby="ranking-title">
        <h2 id="ranking-title" className="text-lg font-semibold">
          Ranking semanal
        </h2>
        <LeaderboardTable rows={ranking} currency={currency} weeklyGoal={weeklyGoal} highlightId={promoter.id} />
      </section>

      <section className="mt-8 flex flex-col gap-3" aria-labelledby="recent-title">
        <h2 id="recent-title" className="text-lg font-semibold">
          Últimos canjes
        </h2>
        {recent.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aún no tienes canjes"
            description="Cuando un cliente use uno de tus códigos en tienda, tu comisión aparecerá aquí."
          />
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{o.productName}</span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono">{o.code}</span> · {formatDateTime(o.redeemedAt as string)}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="font-mono text-sm font-semibold text-primary">
                    +{formatMoney(offerCommission(o, commissionRate), currency)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Venta {formatMoney(discountedPrice(o.productPrice, o.discount), currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
