"use client"

import { useAdmin } from "@/hooks/use-promoter"
import { discountedPrice, isToday, offerStatus, sortedOffers } from "@/lib/offers"
import { offerCommission } from "@/lib/commissions"
import { formatDateTime } from "@/lib/format"
import type { CsvColumn } from "@/lib/csv"
import type { Offer, OfferStatus } from "@/lib/types"
import { PageHeader } from "@/components/app/page-header"
import { ExportButton } from "@/components/app/export-button"
import { OffersBrowser, type Period } from "@/components/offers/offers-browser"

const VIEWS: Record<
  "all" | "active" | "today" | "redeemed" | "cancelled",
  { title: string; description: string; status?: OfferStatus; period?: Period; file: string }
> = {
  all: {
    title: "Ofertas",
    description: "Registro completo de códigos generados por los promotores. Puedes anular las vigentes.",
    file: "ofertas",
  },
  active: {
    title: "Ofertas vigentes",
    description: "Códigos que los clientes todavía pueden usar.",
    status: "active",
    file: "ofertas-vigentes",
  },
  today: {
    title: "Ofertas de hoy",
    description: "Todo lo generado durante el día de hoy.",
    period: "today",
    file: "ofertas-hoy",
  },
  redeemed: {
    title: "Ofertas canjeadas",
    description: "Códigos que ya se usaron en tienda.",
    status: "redeemed",
    file: "ofertas-canjeadas",
  },
  cancelled: {
    title: "Ofertas anuladas",
    description: "Códigos invalidados por un administrador.",
    status: "cancelled",
    file: "ofertas-anuladas",
  },
}

const STATUS_LABEL: Record<OfferStatus, string> = {
  active: "Vigente",
  expired: "Vencida",
  cancelled: "Anulada",
  redeemed: "Canjeada",
}

export function AdminOffers({ view = "all" }: { view?: keyof typeof VIEWS }) {
  const ctx = useAdmin()
  if (!ctx) return null
  const v = VIEWS[view]
  const { offerValidityHours, commissionRate } = ctx.db.settings
  const offers = sortedOffers(ctx.db)
  const exportRows = offers.filter(
    (o) =>
      (!v.status || offerStatus(o, offerValidityHours) === v.status) && (v.period !== "today" || isToday(o.createdAt)),
  )

  const columns: CsvColumn<Offer>[] = [
    { header: "Código", value: (o) => o.code },
    { header: "Generada", value: (o) => formatDateTime(o.createdAt) },
    { header: "Estado", value: (o) => STATUS_LABEL[offerStatus(o, offerValidityHours)] },
    { header: "Promotor", value: (o) => o.promoterName },
    { header: "Código promotor", value: (o) => o.promoterCode },
    { header: "Producto", value: (o) => o.productName },
    { header: "Precio", value: (o) => o.productPrice.toFixed(2) },
    { header: "Descuento %", value: (o) => o.discount },
    { header: "Precio final", value: (o) => discountedPrice(o.productPrice, o.discount).toFixed(2) },
    { header: "Canjeada", value: (o) => (o.redeemedAt ? formatDateTime(o.redeemedAt) : "") },
    { header: "Canjeada por", value: (o) => o.redeemedBy ?? "" },
    { header: "Comisión", value: (o) => (o.redeemedAt ? offerCommission(o, commissionRate).toFixed(2) : "") },
  ]

  return (
    <>
      <PageHeader
        title={v.title}
        description={v.description}
        actions={<ExportButton rows={exportRows} columns={columns} filename={v.file} />}
      />
      <OffersBrowser
        offers={offers}
        settings={ctx.db.settings}
        promoters={ctx.db.promoters}
        cancelActor={ctx.admin.name}
        lockedStatus={v.status}
        lockedPeriod={v.period}
      />
    </>
  )
}
