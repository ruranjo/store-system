"use client"

import { useDb } from "@/hooks/use-db"
import { CatalogBrowser } from "@/components/catalog/catalog-browser"
import { FullscreenLoader } from "@/components/app/fullscreen-loader"

export function PublicCatalog() {
  const db = useDb()
  if (!db) return <FullscreenLoader />
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">Catálogo</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Elige tu producto y compra directo por WhatsApp. ¿Tienes un código de oferta? Inclúyelo en tu mensaje.
        </p>
      </div>
      <CatalogBrowser db={db} hrefBase="/catalogo" />
    </div>
  )
}
