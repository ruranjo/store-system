"use client"

import Link from "next/link"
import { useAdmin } from "@/hooks/use-promoter"
import { isToday, offerStatus, sortedOffers } from "@/lib/offers"
import { formatTime, timeAgo } from "@/lib/format"
import { PageHeader } from "@/components/app/page-header"
import { StatTile } from "@/components/app/stat-tile"
import { DashboardCharts } from "@/components/admin/dashboard-charts"

export function AdminOverview() {
  const ctx = useAdmin()
  if (!ctx) return null
  const { db, admin, isSuper } = ctx
  const { offerValidityHours } = db.settings
  const offers = sortedOffers(db)
  const today = offers.filter((o) => isToday(o.createdAt))
  const active = offers.filter((o) => offerStatus(o, offerValidityHours) === "active")

  const ranking = db.promoters
    .map((p) => ({ promoter: p, count: today.filter((o) => o.promoterId === p.id).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const top = ranking[0]?.count ?? 1

  return (
    <>
      <PageHeader title={`Hola, ${admin.name.split(" ")[0]}`} description="Así va la tienda hoy." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Ofertas hoy" value={today.length} />
        <StatTile label="Ofertas vigentes" value={active.length} />
        <StatTile
          label="Productos activos"
          value={db.products.filter((p) => p.status === "active").length}
          hint={`de ${db.products.length}`}
        />
        <StatTile
          label="Promotores activos"
          value={db.promoters.filter((p) => p.status === "active").length}
          hint={`de ${db.promoters.length}`}
        />
      </div>

      <DashboardCharts db={db} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="ranking" className="flex flex-col gap-3 rounded-xl border bg-card p-5">
          <h2 id="ranking" className="font-semibold">
            Promotores más activos hoy
          </h2>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no se generan ofertas hoy.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {ranking.map(({ promoter, count }) => (
                <li key={promoter.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">
                      {promoter.name} <span className="font-mono text-xs text-muted-foreground">{promoter.code}</span>
                    </span>
                    <span className="font-mono font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(count / top) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="recent" className="flex flex-col gap-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="recent" className="font-semibold">
              Últimas ofertas
            </h2>
            {isSuper && (
              <Link href="/admin/ofertas" className="text-sm text-primary underline-offset-4 hover:underline">
                Ver todas
              </Link>
            )}
          </div>
          {offers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin ofertas registradas.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {offers.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-mono font-semibold">{o.code}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {o.productName} · {o.promoterName}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="font-mono font-semibold text-primary">-{o.discount}%</span>
                    <span className="text-xs text-muted-foreground">{formatTime(o.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="activity" className="mt-6 flex flex-col gap-3 rounded-xl border bg-card p-5">
        <h2 id="activity" className="font-semibold">
          Actividad reciente
        </h2>
        <ul className="flex flex-col gap-2.5">
          {db.activity.slice(0, 8).map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-pretty">
                <span className="font-medium">{a.actor}</span>{" "}
                <span className="text-muted-foreground">{a.message}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
