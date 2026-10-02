"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle, PackageX, TicketPercent } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-db"
import { Button } from "@/components/ui/button"
import { formatMoney, whatsappUrl } from "@/lib/format"
import { findProduct } from "@/lib/products"
import { discountedPrice, findOfferByCode, findOfferThisHour, offerExpiresAt, offerStatus } from "@/lib/offers"
import { EmptyState } from "@/components/app/empty-state"
import { OfferTicket } from "@/components/offers/offer-ticket"
import { GenerateOfferDialog } from "@/components/offers/generate-offer-dialog"

export function ProductDetail({
  productId,
  backHref,
  offerCode,
  mode,
}: {
  productId: string
  backHref: string
  offerCode?: string
  mode: "public" | "promoter"
}) {
  const { db, current } = useCurrentUser()
  const [dialogOpen, setDialogOpen] = useState(false)
  if (!db) return null

  const product = findProduct(db, productId)
  const { settings } = db

  if (!product || product.status !== "active") {
    return (
      <EmptyState
        icon={PackageX}
        title="Producto no disponible"
        description="Este producto ya no está en el catálogo."
        action={
          <Button variant="outline" render={<Link href={backHref} />} nativeButton={false}>
            Volver al catálogo
          </Button>
        }
      />
    )
  }

  const promoter = mode === "promoter" && current?.role === "promoter" ? current.user : null
  const offerThisHour = promoter ? findOfferThisHour(db, promoter.id, product.id) : undefined

  const urlOffer = offerCode ? findOfferByCode(db, offerCode) : undefined
  const urlOfferStatus = urlOffer ? offerStatus(urlOffer, settings.offerValidityHours) : undefined
  const validOffer = urlOffer && urlOffer.productId === product.id && urlOfferStatus === "active" ? urlOffer : undefined
  const finalPrice = validOffer ? discountedPrice(product.price, validOffer.discount) : product.price

  const buyMessage = [
    `Hola, me interesa comprar: ${product.name} (SKU ${product.sku}).`,
    validOffer
      ? `Tengo el código de oferta ${validOffer.code} (${validOffer.discount}% de descuento). Precio final: ${formatMoney(finalPrice, settings.currency)}.`
      : offerCode
        ? `Tengo el código de oferta ${offerCode.toUpperCase()}.`
        : `Precio: ${formatMoney(product.price, settings.currency)}.`,
  ].join("\n")

  return (
    <article className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Catálogo
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="overflow-hidden rounded-2xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- supports user-uploaded data URLs */}
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="aspect-square size-full object-cover" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {product.category} · <span className="font-mono">{product.sku}</span>
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold tracking-tight">{formatMoney(finalPrice, settings.currency)}</span>
            {(validOffer || product.compareAtPrice) && (
              <span className="text-base text-muted-foreground line-through">
                {formatMoney(validOffer ? product.price : (product.compareAtPrice as number), settings.currency)}
              </span>
            )}
          </div>

          {validOffer && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Tu oferta exclusiva</p>
              <OfferTicket
                offer={validOffer}
                expiresAt={offerExpiresAt(validOffer, settings.offerValidityHours)}
                currency={settings.currency}
              />
            </div>
          )}
          {offerCode && !validOffer && (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {urlOffer ? (
                urlOffer.productId !== product.id ? (
                  `El código ${urlOffer.code} corresponde a otro producto.`
                ) : (
                  `La oferta ${urlOffer.code} ya no está vigente.`
                )
              ) : (
                <>
                  Código de oferta{" "}
                  <span className="font-mono font-semibold text-foreground">{offerCode.toUpperCase()}</span>. Se
                  validará al confirmar tu pedido por WhatsApp.
                </>
              )}
            </p>
          )}

          <p className="leading-relaxed text-muted-foreground text-pretty">{product.description}</p>

          {mode === "public" ? (
            <Button
              size="lg"
              className="h-12 w-full text-base md:w-auto md:self-start md:px-6"
              render={<a href={whatsappUrl(settings.whatsappNumber, buyMessage)} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
            >
              <MessageCircle />
              Comprar por WhatsApp
            </Button>
          ) : (
            promoter && (
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <p className="text-sm font-medium">
                  {offerThisHour ? "Ya generaste una oferta para este producto esta hora." : "Genera un código único para tu cliente."}
                </p>
                <Button size="lg" className="h-11 w-full" onClick={() => setDialogOpen(true)}>
                  <TicketPercent />
                  {offerThisHour ? "Ver y compartir oferta" : "Generar oferta"}
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {promoter && (
        <GenerateOfferDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={product}
          promoter={promoter}
          settings={settings}
          existingOffer={offerThisHour}
        />
      )}
    </article>
  )
}
