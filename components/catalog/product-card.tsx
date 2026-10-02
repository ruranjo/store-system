import Link from "next/link"
import { TicketPercent } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatMoney } from "@/lib/format"

export function ProductCard({
  product,
  href,
  currency,
  hasOffer,
}: {
  product: Product
  href: string
  currency: string
  hasOffer?: boolean
}) {
  const savings = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- supports user-uploaded data URLs */}
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {savings > 0 && (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-ticket px-2 py-0.5 font-mono text-xs font-bold text-ticket-foreground">
            -{savings}%
          </span>
        )}
        {hasOffer && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <TicketPercent className="size-3" aria-hidden="true" />
            Oferta activa
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-pretty">{product.name}</h3>
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="font-semibold">{formatMoney(product.price, currency)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice, currency)}
            </span>
          )}
        </p>
      </div>
    </Link>
  )
}
