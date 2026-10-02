"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { TicketX } from "lucide-react"
import { useDb } from "@/hooks/use-db"
import { discountedPrice, findOfferByCode, offerExpiresAt, offerStatus } from "@/lib/offers"
import { formatMoney } from "@/lib/format"
import type { OfferStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FullscreenLoader } from "@/components/app/fullscreen-loader"
import { EmptyState } from "@/components/app/empty-state"
import { StatusBadge } from "@/components/app/status-badge"
import { OfferTicket } from "@/components/offers/offer-ticket"

const STATUS_COPY: Record<Exclude<OfferStatus, "active">, string> = {
  expired: "Este cupón ya venció. Pide a tu promotor un código nuevo.",
  cancelled: "Este cupón fue anulado por la tienda.",
  redeemed: "Este cupón ya fue usado. ¡Gracias por tu compra!",
}

function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function PublicCoupon({ code }: { code: string }) {
  const db = useDb()
  const now = useNow()
  if (!db) return <FullscreenLoader />

  const offer = findOfferByCode(db, code)
  if (!offer) {
    return (
      <EmptyState
        icon={TicketX}
        title="Cupón no encontrado"
        description="Revisa el enlace que te compartieron o pide un código nuevo a tu promotor."
        action={
          <Button render={<Link href="/" />} nativeButton={false}>
            Ver catálogo
          </Button>
        }
      />
    )
  }

  const validity = db.settings.offerValidityHours
  const currency = db.settings.currency
  const status = offerStatus(offer, validity, now)
  const expiresAt = offerExpiresAt(offer, validity)
  const product = db.products.find((p) => p.id === offer.productId)
  const finalPrice = discountedPrice(offer.productPrice, offer.discount)
  const redeemUrl = `${window.location.origin}/admin/canjear?codigo=${encodeURIComponent(offer.code)}`
  const isActive = status === "active"

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {"Cupón compartido por "}
          <span className="font-medium text-foreground">{offer.promoterName}</span>
        </p>
        <h1 className="text-balance text-2xl font-semibold md:text-3xl">
          {offer.discount}% de descuento en {offer.productName}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-4" aria-label="Producto">
          {product?.image && (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 28rem, 100vw"
                className={isActive ? "object-cover" : "object-cover opacity-60 grayscale"}
                priority
              />
            </div>
          )}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground line-through">{formatMoney(offer.productPrice, currency)}</p>
              <p className="text-3xl font-semibold text-primary">{formatMoney(finalPrice, currency)}</p>
            </div>
            {product && (
              <Button
                variant="outline"
                render={<Link href={`/catalogo/${product.id}?oferta=${encodeURIComponent(offer.code)}`} />}
                nativeButton={false}
              >
                Ver producto
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-label="Tu cupón">
          <OfferTicket offer={offer} status={status} currency={currency} expiresAt={expiresAt} />

          {isActive ? (
            <>
              <div className="flex items-center justify-between rounded-xl border bg-card p-4">
                <span className="text-sm text-muted-foreground">Vence en</span>
                <span className="font-mono text-2xl font-semibold tabular-nums" aria-live="off">
                  {formatCountdown(expiresAt.getTime() - now)}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
                <div className="rounded-lg bg-background p-3 text-foreground">
                  <QRCodeSVG
                    value={redeemUrl}
                    size={176}
                    fgColor="currentColor"
                    bgColor="transparent"
                    level="M"
                    title={`Código QR del cupón ${offer.code}`}
                  />
                </div>
                <p className="font-mono text-xl font-semibold tracking-widest">{offer.code}</p>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Muestra este código en caja para recibir tu descuento.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-4">
              <StatusBadge status={status} />
              <p className="text-sm leading-relaxed text-muted-foreground">{STATUS_COPY[status]}</p>
              <Button render={<Link href="/" />} nativeButton={false}>
                Ver catálogo
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
