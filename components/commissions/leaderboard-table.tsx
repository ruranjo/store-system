import type { Earnings } from "@/lib/commissions"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function LeaderboardTable({
  rows,
  currency,
  weeklyGoal,
  highlightId,
  showTotals = false,
}: {
  rows: Earnings[]
  currency: string
  weeklyGoal: number
  highlightId?: string
  showTotals?: boolean
}) {
  if (rows.length === 0) {
    return <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">No hay promotores activos.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Ranking semanal de promotores</caption>
        <thead className="border-b text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="w-12 px-4 py-3 font-medium">#</th>
            <th scope="col" className="px-4 py-3 font-medium">Promotor</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Canjes semana</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Comisión semana</th>
            {showTotals && (
              <>
                <th scope="col" className="px-4 py-3 text-right font-medium">Conversión</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Comisión total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => {
            const isMe = r.promoter.id === highlightId
            const reached = r.redeemedWeek >= weeklyGoal
            return (
              <tr key={r.promoter.id} className={cn(isMe && "bg-accent/60")} aria-current={isMe ? "true" : undefined}>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full font-mono text-xs font-semibold",
                      i === 0 && r.redeemedWeek > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.promoter.name}</span>
                    {isMe && <span className="text-xs text-muted-foreground">(tú)</span>}
                    {reached && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Meta semanal
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {r.redeemedWeek}
                  <span className="font-normal text-muted-foreground">/{weeklyGoal}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatMoney(r.earnedWeek, currency)}</td>
                {showTotals && (
                  <>
                    <td className="px-4 py-3 text-right font-mono">
                      {r.generated ? `${Math.round(r.conversion * 100)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(r.earnedTotal, currency)}</td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
