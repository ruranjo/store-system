"use client"

import { useMemo, useState } from "react"
import { PackageSearch, Search } from "lucide-react"
import type { Database, Product } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { activeProducts } from "@/lib/products"
import { findOfferThisHour } from "@/lib/offers"
import { NativeSelect } from "@/components/app/native-select"
import { EmptyState } from "@/components/app/empty-state"
import { ProductCard } from "@/components/catalog/product-card"

type Sort = "recent" | "price-asc" | "price-desc" | "name"

export function CatalogBrowser({
  db,
  hrefBase,
  promoterId,
  filter,
}: {
  db: Database
  hrefBase: string
  /** Marks products that already have an offer this hour. */
  promoterId?: string
  /** Extra restriction applied on top of the active-products list. */
  filter?: (product: Product) => boolean
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<Sort>("recent")

  const products = filter ? activeProducts(db).filter(filter) : activeProducts(db)
  const categories = useMemo(
    () => db.settings.categories.filter((c) => products.some((p) => p.category === c)),
    [db.settings.categories, products],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    )
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price
      if (sort === "price-desc") return b.price - a.price
      if (sort === "name") return a.name.localeCompare(b.name, "es")
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [products, query, category, sort])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos"
            aria-label="Buscar productos"
            className="h-10 bg-card pl-9"
          />
        </div>
        <NativeSelect
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Ordenar"
          className="sm:w-48 [&_select]:h-10"
        >
          <option value="recent">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name">Nombre (A–Z)</option>
        </NativeSelect>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Categorías">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
              category === c ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted",
            )}
          >
            {c === "all" ? "Todo" : c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No encontramos productos"
          description="Prueba con otra búsqueda o categoría."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {visible.map((p) => (
            <li key={p.id} className="flex">
              <ProductCard
                product={p}
                href={`${hrefBase}/${p.id}`}
                currency={db.settings.currency}
                hasOffer={promoterId ? !!findOfferThisHour(db, promoterId, p.id) : false}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
