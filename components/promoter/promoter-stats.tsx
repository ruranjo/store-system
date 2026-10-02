"use client"

import { usePromoter } from "@/hooks/use-promoter"
import { isToday, offerStatus, offersForPromoter } from "@/lib/offers"
import { PageHeader } from "@/components/app/page-header"
import { StatTile } from "@/components/app/stat-tile"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function PromoterStats() {
  const ctx = usePromoter()
  if (!ctx) return null
  const { db, promoter } = ctx
  const offers = offersForPromoter(db, promoter.id)
  const now = Date.now()
  const avg = offers.length ? offers.reduce((s, o) => s + o.discount, 0) / offers.length : 0

  const byProduct = Object.values(
    offers.reduce<Record<string, { name: string; count: number }>>((acc, o) => {
      acc[o.productId] ??= { name: o.productName, count: 0 }
      acc[o.productId].count++
      return acc
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const top = byProduct[0]?.count ?? 1

  return (
    <>
      <PageHeader title="Estadísticas" description="Tu actividad como promotor." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Hoy" value={offers.filter((o) => isToday(o.createdAt)).length} />
        <StatTile label="Últimos 7 días" value={offers.filter((o) => now - new Date(o.createdAt).getTime() < WEEK_MS).length} />
        <StatTile
          label="Vigentes"
          value={offers.filter((o) => offerStatus(o, db.settings.offerValidityHours) === "active").length}
        />
        <StatTile label="Descuento promedio" value={avg ? `${avg.toFixed(1)}%` : "—"} hint={`${offers.length} en total`} />
      </div>

      <section aria-labelledby="top-products" className="mt-6 flex flex-col gap-3 rounded-xl border bg-card p-5">
        <h2 id="top-products" className="font-semibold">
          Productos que más ofertas
        </h2>
        {byProduct.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no generas ofertas.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {byProduct.map((p) => (
              <li key={p.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono font-semibold">{p.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(p.count / top) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}
