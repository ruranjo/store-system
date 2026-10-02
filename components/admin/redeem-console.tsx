"use client"

import { useState } from "react"
import { CircleAlert, CircleCheck, ScanLine } from "lucide-react"
import { toast } from "sonner"
import { useAdmin } from "@/hooks/use-promoter"
import { discountedPrice, findOfferByCode, offerExpiresAt, offerStatus, redeemOffer, redeemedOffers } from "@/lib/offers"
import { formatDateTime, formatMoney, timeAgo } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { EmptyState } from "@/components/app/empty-state"
import { OfferTicket } from "@/components/offers/offer-ticket"

const BLOCKED_REASON = {
  redeemed: "Este código ya fue canjeado. No se puede usar dos veces.",
  cancelled: "Un administrador anuló este código.",
  expired: "La vigencia de este código terminó.",
} as const

export function RedeemConsole({ initialCode = "" }: { initialCode?: string }) {
  const ctx = useAdmin()
  const [code, setCode] = useState(initialCode)
  const [lookup, setLookup] = useState(initialCode.trim().toUpperCase())
  if (!ctx) return null

  const { db, admin } = ctx
  const currency = db.settings.currency
  const offer = lookup ? findOfferByCode(db, lookup) : undefined
  const status = offer ? offerStatus(offer, db.settings.offerValidityHours) : undefined
  const product = offer ? db.products.find((p) => p.id === offer.productId) : undefined
  const recent = redeemedOffers(db).slice(0, 8)

  function handleRedeem() {
    if (!offer) return
    const result = redeemOffer(offer.code, admin.name)
    if (result.ok) toast.success(`Código ${offer.code} canjeado`)
    else toast.error(result.error)
  }

  return (
    <>
      <PageHeader
        title="Canjear código"
        description="Valida el código que presenta el cliente en caja. Cada código se puede canjear una sola vez."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="flex flex-col gap-4 lg:col-span-3" aria-labelledby="redeem-title">
          <h2 id="redeem-title" className="sr-only">
            Validar código
          </h2>
          <form
            className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              setLookup(code.trim().toUpperCase())
            }}
          >
            <label htmlFor="redeem-code" className="sr-only">
              Código de oferta
            </label>
            <Input
              id="redeem-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. PER06-1A2B"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="h-11 font-mono text-base tracking-wider"
            />
            <Button type="submit" size="lg" className="h-11" disabled={!code.trim()}>
              <ScanLine aria-hidden="true" />
              Validar
            </Button>
          </form>

          <div aria-live="polite" className="flex flex-col gap-4">
            {lookup && !offer && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
                <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Código no encontrado</p>
                  <p className="text-sm leading-relaxed">
                    {"Revisa que el código "}
                    <span className="font-mono">{lookup}</span>
                    {" esté bien escrito."}
                  </p>
                </div>
              </div>
            )}

            {offer && status && (
              <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Resultado de la validación</p>
                  <StatusBadge status={status} />
                </div>

                <OfferTicket
                  offer={offer}
                  status={status}
                  currency={currency}
                  expiresAt={offerExpiresAt(offer, db.settings.offerValidityHours)}
                />

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Promotor</dt>
                    <dd className="font-medium">{offer.promoterName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Generado</dt>
                    <dd className="font-medium">{formatDateTime(offer.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Precio normal</dt>
                    <dd className="font-medium">{formatMoney(offer.productPrice, currency)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">El cliente paga</dt>
                    <dd className="text-lg font-semibold text-primary">
                      {formatMoney(discountedPrice(offer.productPrice, offer.discount), currency)}
                    </dd>
                  </div>
                  {offer.redeemedAt && (
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Canjeado</dt>
                      <dd className="font-medium">
                        {formatDateTime(offer.redeemedAt)}
                        {offer.redeemedBy ? ` por ${offer.redeemedBy}` : ""}
                      </dd>
                    </div>
                  )}
                </dl>

                {product && product.status !== "active" && status === "active" && (
                  <p className="text-sm text-muted-foreground">El producto está inactivo en el catálogo.</p>
                )}

                {status === "active" ? (
                  <Button size="lg" className="h-12 text-base" onClick={handleRedeem}>
                    <CircleCheck aria-hidden="true" />
                    Confirmar canje
                  </Button>
                ) : (
                  <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed text-muted-foreground">
                    {BLOCKED_REASON[status]}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 lg:col-span-2" aria-labelledby="recent-title">
          <h2 id="recent-title" className="font-semibold">
            Canjes recientes
          </h2>
          {recent.length === 0 ? (
            <EmptyState icon={ScanLine} title="Sin canjes todavía" description="Los códigos que canjees aparecerán aquí." />
          ) : (
            <ul className="flex flex-col divide-y rounded-xl border bg-card">
              {recent.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-muted/60"
                    onClick={() => {
                      setCode(o.code)
                      setLookup(o.code)
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-sm font-medium">{o.code}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.productName} · {o.promoterName}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold">-{o.discount}%</span>
                      <span className="block text-xs text-muted-foreground">{timeAgo(o.redeemedAt ?? o.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
