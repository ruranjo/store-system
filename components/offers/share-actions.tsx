"use client"

import { Copy, Link2, MessageCircle, Share2 } from "lucide-react"
import { toast } from "sonner"
import type { Offer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { discountedPrice, offerExpiresAt } from "@/lib/offers"
import { formatDateTime, formatMoney, whatsappUrl } from "@/lib/format"

export function offerLink(offer: Offer) {
  return `${window.location.origin}/oferta/${encodeURIComponent(offer.code)}`
}

export function offerShareMessage(offer: Offer, currency: string, validityHours: number) {
  const final = formatMoney(discountedPrice(offer.productPrice, offer.discount), currency)
  const before = formatMoney(offer.productPrice, currency)
  const until = formatDateTime(offerExpiresAt(offer, validityHours).toISOString())
  return [
    `¡Hola! Tengo una oferta exclusiva para ti:`,
    `${offer.productName} con ${offer.discount}% de descuento.`,
    `Antes ${before}, ahora ${final}.`,
    `Código: ${offer.code}`,
    `Válido hasta ${until}.`,
    `Míralo aquí: ${offerLink(offer)}`,
  ].join("\n")
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copiado`)
  } catch {
    toast.error("No se pudo copiar. Cópialo manualmente.")
  }
}

export function ShareActions({
  offer,
  currency,
  validityHours,
}: {
  offer: Offer
  currency: string
  validityHours: number
}) {
  const message = () => offerShareMessage(offer, currency, validityHours)
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        className="h-11 w-full text-sm"
        render={<a href={whatsappUrl("", message())} target="_blank" rel="noopener noreferrer" />}
        nativeButton={false}
      >
        <MessageCircle />
        Compartir por WhatsApp
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" className="h-10" onClick={() => copy(offer.code, "Código")}>
          <Copy />
          Copiar código
        </Button>
        <Button variant="outline" size="lg" className="h-10" onClick={() => copy(offerLink(offer), "Enlace")}>
          <Link2 />
          Copiar enlace
        </Button>
      </div>
      {canShare && (
        <Button
          variant="ghost"
          size="lg"
          className="h-10"
          onClick={() =>
            navigator.share({ title: offer.productName, text: message() }).catch(() => {
              /* user dismissed the share sheet */
            })
          }
        >
          <Share2 />
          Más opciones para compartir
        </Button>
      )}
    </div>
  )
}
