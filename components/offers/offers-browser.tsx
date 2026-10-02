"use client"

import { useMemo, useState } from "react"
import { Ban, Search, TicketPercent } from "lucide-react"
import type { Offer, OfferStatus, Promoter, Settings } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NativeSelect } from "@/components/app/native-select"
import { StatusBadge } from "@/components/app/status-badge"
import { EmptyState } from "@/components/app/empty-state"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { cancelOffer, discountedPrice, offerStatus } from "@/lib/offers"
import { formatDateTime, formatMoney } from "@/lib/format"

const PERIODS = {
  all: { label: "Todo", ms: Number.POSITIVE_INFINITY },
  today: { label: "Hoy", ms: 0 },
  "7d": { label: "Últimos 7 días", ms: 7 * 86_400_000 },
  "30d": { label: "Últimos 30 días", ms: 30 * 86_400_000 },
} as const

export type Period = keyof typeof PERIODS

function inPeriod(iso: string, period: Period) {
  if (period === "all") return true
  if (period === "today") return new Date(iso).toDateString() === new Date().toDateString()
  return Date.now() - new Date(iso).getTime() <= PERIODS[period].ms
}

export function OffersBrowser({
  offers,
  settings,
  promoters,
  cancelActor,
  lockedStatus,
  lockedPeriod,
}: {
  offers: Offer[]
  settings: Settings
  /** When provided, shows the promoter column and filter. */
  promoters?: Promoter[]
  /** When provided, allows cancelling active offers. */
  cancelActor?: string
  /** Fixes the status filter and hides its control (used by submodule views). */
  lockedStatus?: OfferStatus
  /** Fixes the period filter and hides its control. */
  lockedPeriod?: Period
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatus] = useState<"all" | OfferStatus>("all")
  const [promoterId, setPromoterId] = useState("all")
  const [periodFilter, setPeriod] = useState<Period>("all")
  const status = lockedStatus ?? statusFilter
  const period = lockedPeriod ?? periodFilter
  const [toCancel, setToCancel] = useState<Offer | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return offers
      .map((o) => ({ offer: o, status: offerStatus(o, settings.offerValidityHours) }))
      .filter(({ offer, status: s }) => {
        if (status !== "all" && s !== status) return false
        if (promoterId !== "all" && offer.promoterId !== promoterId) return false
        if (!inPeriod(offer.createdAt, period)) return false
        if (!q) return true
        return (
          offer.code.toLowerCase().includes(q) ||
          offer.productName.toLowerCase().includes(q) ||
          offer.promoterName.toLowerCase().includes(q)
        )
      })
  }, [offers, query, status, promoterId, period, settings.offerValidityHours])

  const showPromoter = !!promoters

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={showPromoter ? "Buscar código, producto o promotor" : "Buscar código o producto"}
            aria-label="Buscar ofertas"
            className="h-9 bg-card pl-9"
          />
        </div>
        {!lockedStatus && (
          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
            aria-label="Estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="expired">Expiradas</option>
            <option value="redeemed">Canjeadas</option>
            <option value="cancelled">Anuladas</option>
          </NativeSelect>
        )}
        {!lockedPeriod && (
          <NativeSelect value={periodFilter} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Periodo">
            {Object.entries(PERIODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </NativeSelect>
        )}
        {showPromoter && (
          <NativeSelect value={promoterId} onChange={(e) => setPromoterId(e.target.value)} aria-label="Promotor">
            <option value="all">Todos los promotores</option>
            {promoters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {rows.length} {rows.length === 1 ? "oferta" : "ofertas"}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          icon={TicketPercent}
          title="Sin ofertas"
          description="No hay ofertas que coincidan con los filtros seleccionados."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {rows.map(({ offer, status: s }) => (
              <li key={offer.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm font-semibold break-all">{offer.code}</p>
                  <StatusBadge status={s} label={s === "active" ? "Activa" : undefined} />
                </div>
                <p className="text-sm">{offer.productName}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {showPromoter ? `${offer.promoterName} · ` : ""}
                    {formatDateTime(offer.createdAt)}
                  </span>
                  <span className="font-mono font-semibold text-foreground">-{offer.discount}%</span>
                </div>
                {cancelActor && s === "active" && (
                  <Button variant="destructive" size="sm" className="self-start" onClick={() => setToCancel(offer)}>
                    <Ban />
                    Anular
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Código</TableHead>
                  <TableHead>Producto</TableHead>
                  {showPromoter && <TableHead>Promotor</TableHead>}
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Precio final</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  {cancelActor && <TableHead className="pr-4 text-right"><span className="sr-only">Acciones</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ offer, status: s }) => (
                  <TableRow key={offer.id}>
                    <TableCell className="pl-4 font-mono text-xs font-semibold">{offer.code}</TableCell>
                    <TableCell className="max-w-48 truncate">{offer.productName}</TableCell>
                    {showPromoter && (
                      <TableCell>
                        <span className="flex flex-col">
                          <span>{offer.promoterName}</span>
                          <span className="font-mono text-xs text-muted-foreground">{offer.promoterCode}</span>
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono">{offer.discount}%</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(discountedPrice(offer.productPrice, offer.discount), settings.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(offer.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={s} label={s === "active" ? "Activa" : undefined} />
                    </TableCell>
                    {cancelActor && (
                      <TableCell className="pr-4 text-right">
                        {s === "active" && (
                          <Button variant="ghost" size="sm" onClick={() => setToCancel(offer)}>
                            Anular
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {cancelActor && (
        <ConfirmDialog
          open={!!toCancel}
          onOpenChange={(o) => !o && setToCancel(null)}
          title="Anular oferta"
          description={`La oferta ${toCancel?.code ?? ""} dejará de ser válida. Esta acción no se puede deshacer.`}
          confirmLabel="Anular oferta"
          destructive
          onConfirm={() => toCancel && cancelOffer(toCancel.id, cancelActor)}
        />
      )}
    </div>
  )
}
