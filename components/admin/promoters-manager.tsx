"use client"

import { useState } from "react"
import { Pencil, Plus, Users } from "lucide-react"
import type { Promoter } from "@/lib/types"
import { useAdmin } from "@/hooks/use-promoter"
import { setPromoterStatus } from "@/lib/promoters"
import { isToday } from "@/lib/offers"
import { initials } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { PromoterFormDialog } from "@/components/admin/promoter-form-dialog"

export function PromotersManager() {
  const ctx = useAdmin()
  const [editing, setEditing] = useState<Promoter | undefined>()
  const [open, setOpen] = useState(false)
  if (!ctx) return null
  const { db, admin } = ctx

  const stats = new Map<string, { total: number; today: number }>()
  for (const o of db.offers) {
    const s = stats.get(o.promoterId) ?? { total: 0, today: 0 }
    s.total++
    if (isToday(o.createdAt)) s.today++
    stats.set(o.promoterId, s)
  }

  function openForm(p?: Promoter) {
    setEditing(p)
    setOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Promotores"
        description="Cada promotor recibe un código único que aparece en todas sus ofertas."
        actions={
          <Button size="lg" onClick={() => openForm()}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Nuevo promotor
          </Button>
        }
      />
      {db.promoters.length === 0 ? (
        <EmptyState icon={Users} title="Sin promotores" description="Registra al primer promotor de tu equipo." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {db.promoters.map((p) => {
            const s = stats.get(p.id) ?? { total: 0, today: 0 }
            return (
              <li key={p.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                  >
                    {initials(p.name)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">{p.code}</span> · @{p.username}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openForm(p)} aria-label={`Editar ${p.name}`}>
                    <Pencil aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{s.today}</span> hoy ·{" "}
                    <span className="font-mono font-semibold text-foreground">{s.total}</span> en total
                  </span>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.status === "active" ? "Activo" : "Inactivo"}
                    <Switch
                      checked={p.status === "active"}
                      onCheckedChange={(v) => setPromoterStatus(p.id, v ? "active" : "inactive", admin.name)}
                      aria-label={`${p.status === "active" ? "Desactivar" : "Activar"} a ${p.name}`}
                    />
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <PromoterFormDialog open={open} onOpenChange={setOpen} promoter={editing} actor={admin.name} />
    </>
  )
}
