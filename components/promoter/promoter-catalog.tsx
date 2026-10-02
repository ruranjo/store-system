"use client"

import { usePromoter } from "@/hooks/use-promoter"
import { findOfferThisHour } from "@/lib/offers"
import { PageHeader } from "@/components/app/page-header"
import { CatalogBrowser } from "@/components/catalog/catalog-browser"

export function PromoterCatalog({ view = "all" }: { view?: "all" | "pending" }) {
  const ctx = usePromoter()
  if (!ctx) return null
  const { db, promoter } = ctx
  const pending = view === "pending"
  return (
    <>
      <PageHeader
        title={pending ? "Sin oferta esta hora" : "Catálogo"}
        description={
          pending
            ? "Productos para los que todavía puedes generar un código en la hora actual."
            : "Abre un producto para generar tu código de oferta. Puedes crear una oferta por producto cada hora."
        }
      />
      <CatalogBrowser
        db={db}
        hrefBase="/promotor/catalogo"
        promoterId={promoter.id}
        filter={pending ? (p) => !findOfferThisHour(db, promoter.id, p.id) : undefined}
      />
    </>
  )
}
