"use client"

import { useAdmin } from "@/hooks/use-promoter"
import { PageHeader } from "@/components/app/page-header"
import { CatalogBrowser } from "@/components/catalog/catalog-browser"

export function CatalogPreview() {
  const ctx = useAdmin()
  if (!ctx) return null
  return (
    <>
      <PageHeader
        title="Vista previa del catálogo"
        description="Así ven los clientes los productos activos en la tienda pública."
      />
      <CatalogBrowser db={ctx.db} hrefBase="/catalogo" />
    </>
  )
}
