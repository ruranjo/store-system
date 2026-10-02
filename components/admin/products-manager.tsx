"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useAdmin } from "@/hooks/use-promoter"
import { deleteProduct, setProductStatus } from "@/lib/products"
import { formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { NativeSelect } from "@/components/app/native-select"
import { ProductFormDialog } from "@/components/admin/product-form-dialog"

const LOCKED_TITLE = { active: "Productos activos", inactive: "Productos inactivos" } as const

export function ProductsManager({ lockedStatus }: { lockedStatus?: "active" | "inactive" } = {}) {
  const ctx = useAdmin()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatus] = useState<"all" | "active" | "inactive">("all")
  const status = lockedStatus ?? statusFilter
  const [editing, setEditing] = useState<Product | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const products = ctx?.db.products
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (products ?? []).filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    )
  }, [products, query, status])

  if (!ctx) return null
  const { db, admin } = ctx
  const { currency } = db.settings

  function openForm(product?: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <>
      <PageHeader
        title={lockedStatus ? LOCKED_TITLE[lockedStatus] : "Productos"}
        description={`${db.products.length} productos · ${db.products.filter((p) => p.status === "active").length} visibles en el catálogo`}
        actions={
          <Button size="lg" onClick={() => openForm()}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Nuevo producto
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar por nombre o SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
        {!lockedStatus && (
          <NativeSelect
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
            className="sm:w-44"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </NativeSelect>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={db.products.length === 0 ? "Sin productos" : "Sin resultados"}
          description={
            db.products.length === 0 ? "Crea tu primer producto para empezar." : "Prueba con otra búsqueda o filtro."
          }
        />
      ) : (
        <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3 md:gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={p.image || "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized={p.image.startsWith("data:")}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{p.sku}</span> · {p.category}
                </p>
              </div>
              <span className="hidden font-mono text-sm font-medium sm:block">{formatMoney(p.price, currency)}</span>
              <Switch
                checked={p.status === "active"}
                onCheckedChange={(v) => setProductStatus(p.id, v ? "active" : "inactive", admin.name)}
                aria-label={`${p.status === "active" ? "Desactivar" : "Activar"} ${p.name}`}
              />
              <div className="flex">
                <Button variant="ghost" size="icon" onClick={() => openForm(p)} aria-label={`Editar ${p.name}`}>
                  <Pencil aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleting(p)} aria-label={`Eliminar ${p.name}`}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        settings={db.settings}
        actor={admin.name}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Eliminar producto"
        description={`"${deleting?.name ?? ""}" se eliminará del catálogo. Las ofertas ya generadas se conservan en el historial.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (!deleting) return
          deleteProduct(deleting.id, admin.name)
          toast.success("Producto eliminado")
        }}
      />
    </>
  )
}
