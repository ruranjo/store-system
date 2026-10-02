import type { Offer, OfferStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatDateTime, formatMoney } from "@/lib/format"
import { discountedPrice } from "@/lib/offers"

export function OfferTicket({
  offer,
  expiresAt,
  currency,
  status = "active",
  className,
}: {
  offer: Offer
  expiresAt: Date
  currency: string
  status?: OfferStatus
  className?: string
}) {
  const muted = status !== "active"
  return (
    <div
      className={cn(
        "ticket-notch flex min-h-32 overflow-hidden rounded-xl",
        muted ? "bg-muted text-muted-foreground" : "bg-ticket text-ticket-foreground",
        className,
      )}
    >
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 px-2 sm:w-28">
        <span className="font-mono text-3xl font-bold tracking-tighter sm:text-4xl">-{offer.discount}%</span>
        <span className="text-[11px] font-medium uppercase tracking-widest opacity-70">Descuento</span>
      </div>
      <div className="my-3 border-l-2 border-dashed border-current opacity-25" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-3.5 pr-5 pl-4">
        <div className="flex flex-col gap-0.5">
          <p className="truncate text-sm font-semibold">{offer.productName}</p>
          <p className="text-xs opacity-75">
            <span className="line-through">{formatMoney(offer.productPrice, currency)}</span>{" "}
            <span className="font-semibold">
              {formatMoney(discountedPrice(offer.productPrice, offer.discount), currency)}
            </span>
          </p>
        </div>
        <p className="font-mono text-base font-bold tracking-wider break-all sm:text-lg">{offer.code}</p>
        <p className="text-[11px] leading-tight opacity-75">
          {status === "cancelled"
            ? "Oferta anulada"
            : status === "redeemed" && offer.redeemedAt
              ? `Canjeada el ${formatDateTime(offer.redeemedAt)}`
            : status === "expired"
              ? `Expiró el ${formatDateTime(expiresAt.toISOString())}`
              : `Válida hasta ${formatDateTime(expiresAt.toISOString())}`}
          {" · "}
          {offer.promoterCode}
        </p>
      </div>
    </div>
  )
}
