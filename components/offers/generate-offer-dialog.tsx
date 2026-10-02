"use client"

import { useState } from "react"
import { Clock, TicketPercent } from "lucide-react"
import { toast } from "sonner"
import type { Offer, Product, Promoter, Settings } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatMoney, minutesUntilNextHour } from "@/lib/format"
import { createOffer, discountedPrice, DISCOUNT_PRESETS, offerExpiresAt, offerStatus } from "@/lib/offers"
import { OfferTicket } from "@/components/offers/offer-ticket"
import { ShareActions } from "@/components/offers/share-actions"

export function GenerateOfferDialog({
  open,
  onOpenChange,
  product,
  promoter,
  settings,
  existingOffer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  promoter: Promoter
  settings: Settings
  existingOffer?: Offer
}) {
  const presets = DISCOUNT_PRESETS.filter((d) => d <= settings.maxDiscount)
  const [discount, setDiscount] = useState<number>(presets[1] ?? presets[0] ?? 5)
  const [created, setCreated] = useState<Offer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const shown = created ?? existingOffer
  const isDuplicate = !created && !!existingOffer

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCreated(null)
      setError(null)
    }
    onOpenChange(next)
  }

  function handleGenerate() {
    const result = createOffer(promoter.id, product.id, discount)
    if (result.ok) {
      setCreated(result.offer)
      toast.success("Oferta generada")
    } else if (result.reason === "duplicate") {
      setError(null)
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shown ? (isDuplicate ? "Ya tienes una oferta activa" : "¡Oferta lista!") : "Generar oferta"}</DialogTitle>
          <DialogDescription>
            {shown
              ? isDuplicate
                ? "Solo puedes generar una oferta por producto cada hora. Comparte la que ya tienes."
                : "Comparte el código con tu cliente. Es único y queda registrado a tu nombre."
              : product.name}
          </DialogDescription>
        </DialogHeader>

        {shown ? (
          <div className="flex flex-col gap-4">
            <OfferTicket
              offer={shown}
              expiresAt={offerExpiresAt(shown, settings.offerValidityHours)}
              currency={settings.currency}
              status={offerStatus(shown, settings.offerValidityHours)}
            />
            {isDuplicate && (
              <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                Podrás generar una nueva en {minutesUntilNextHour()} min.
              </p>
            )}
            <ShareActions offer={shown} currency={settings.currency} validityHours={settings.offerValidityHours} />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-sm font-medium">Descuento</legend>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={discount === d}
                    onClick={() => setDiscount(d)}
                    className={cn(
                      "h-11 rounded-lg border font-mono text-sm font-semibold transition-colors",
                      discount === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted",
                    )}
                  >
                    {d}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="custom-discount" className="shrink-0 text-muted-foreground">
                  Otro valor
                </Label>
                <div className="relative w-28">
                  <Input
                    id="custom-discount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={settings.maxDiscount}
                    value={discount}
                    onChange={(e) => {
                      const n = Math.round(Number(e.target.value))
                      setDiscount(Math.min(settings.maxDiscount, Math.max(1, Number.isFinite(n) ? n : 1)))
                    }}
                    className="h-10 pr-7 font-mono"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Máx. {settings.maxDiscount}%</span>
              </div>
            </fieldset>

            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Precio para el cliente</span>
              <span className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoney(product.price, settings.currency)}
                </span>
                <span className="text-lg font-semibold">
                  {formatMoney(discountedPrice(product.price, discount), settings.currency)}
                </span>
              </span>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button size="lg" className="h-11 w-full" onClick={handleGenerate}>
              <TicketPercent />
              Generar código de {discount}%
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
