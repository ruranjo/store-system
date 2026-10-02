"use client"

import { useAdmin } from "@/hooks/use-promoter"
import { isToday, offerStatus } from "@/lib/offers"
import { earningsFor } from "@/lib/commissions"
import { formatMoney } from "@/lib/format"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { ExportButton } from "@/components/app/export-button"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function PromoterPerformance() {
  const ctx = useAdmin()
  if (!ctx) return null
  const { db } = ctx
  const now = Date.now()

  const rows = db.promoters
    .map((p) => {
      const mine = db.offers.filter((o) => o.promoterId === p.id)
      const avg = mine.length ? mine.reduce((s, o) => s + o.discount, 0) / mine.length : 0
      return {
        promoter: p,
        total: mine.length,
        today: mine.filter((o) => isToday(o.createdAt)).length,
        week: mine.filter((o) => now - new Date(o.createdAt).getTime() < WEEK_MS).length,
        active: mine.filter((o) => offerStatus(o, db.settings.offerValidityHours) === "active").length,
        avg,
        redeemed: mine.filter((o) => o.redeemedAt).length,
        earned: earningsFor(db, p).earnedTotal,
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <>
      <PageHeader
        title="Rendimiento"
        description="Comparativa de ofertas generadas por cada promotor."
        actions={
          <ExportButton
            rows={rows}
            filename="rendimiento-promotores"
            columns={[
              { header: "Promotor", value: (r) => r.promoter.name },
              { header: "Código", value: (r) => r.promoter.code },
              { header: "Estado", value: (r) => (r.promoter.status === "active" ? "Activo" : "Inactivo") },
              { header: "Ofertas hoy", value: (r) => r.today },
              { header: "Ofertas 7 días", value: (r) => r.week },
              { header: "Ofertas total", value: (r) => r.total },
              { header: "Vigentes", value: (r) => r.active },
              { header: "Descuento promedio %", value: (r) => r.avg.toFixed(1) },
              { header: "Canjes", value: (r) => r.redeemed },
              { header: "Comisión total", value: (r) => r.earned.toFixed(2) },
            ]}
          />
        }
      />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Promotor</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Hoy</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">7 días</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Vigentes</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Desc. prom.</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Canjes</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Comisión</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.promoter.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.promoter.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{r.promoter.code}</span>
                    {r.promoter.status === "inactive" && <StatusBadge status="inactive" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">{r.today}</td>
                <td className="px-4 py-3 text-right font-mono">{r.week}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{r.total}</td>
                <td className="px-4 py-3 text-right font-mono">{r.active}</td>
                <td className="px-4 py-3 text-right font-mono">{r.avg ? `${r.avg.toFixed(1)}%` : "—"}</td>
                <td className="px-4 py-3 text-right font-mono">{r.redeemed}</td>
                <td className="px-4 py-3 text-right font-mono">{formatMoney(r.earned, db.settings.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
