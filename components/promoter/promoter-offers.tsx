"use client"

import { usePromoter } from "@/hooks/use-promoter"
import { offersForPromoter } from "@/lib/offers"
import type { OfferStatus } from "@/lib/types"
import { PageHeader } from "@/components/app/page-header"
import { OffersBrowser } from "@/components/offers/offers-browser"

const VIEWS: Record<
  "all" | "active" | "redeemed" | "expired",
  { title: string; description: string; status?: OfferStatus }
> = {
  redeemed: { title: "Ofertas canjeadas", description: "Códigos que tus clientes ya usaron en tienda.", status: "redeemed" },
  all: { title: "Mis ofertas", description: "Historial de todos los códigos que has generado." },
  active: { title: "Ofertas vigentes", description: "Códigos que tus clientes todavía pueden usar.", status: "active" },
  expired: { title: "Ofertas vencidas", description: "Códigos cuya vigencia ya terminó.", status: "expired" },
}

export function PromoterOffers({ view = "all" }: { view?: keyof typeof VIEWS }) {
  const ctx = usePromoter()
  if (!ctx) return null
  const v = VIEWS[view]
  return (
    <>
      <PageHeader title={v.title} description={v.description} />
      <OffersBrowser
        offers={offersForPromoter(ctx.db, ctx.promoter.id)}
        settings={ctx.db.settings}
        lockedStatus={v.status}
      />
    </>
  )
}
