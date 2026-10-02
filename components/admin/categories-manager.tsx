"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useAdmin } from "@/hooks/use-promoter"
import { updateSettings } from "@/lib/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/app/page-header"

export function CategoriesManager() {
  const ctx = useAdmin()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  if (!ctx) return null
  const { db, admin } = ctx
  const categories = db.settings.categories

  function add(e: React.FormEvent) {
    e.preventDefault()
    const value = name.trim()
    if (!value) return setError("Escribe un nombre.")
    if (categories.some((c) => c.toLowerCase() === value.toLowerCase())) return setError("Esa categoría ya existe.")
    updateSettings({ ...db.settings, categories: [...categories, value] }, admin.name)
    setName("")
    setError(null)
  }

  function remove(category: string) {
    updateSettings({ ...db.settings, categories: categories.filter((c) => c !== category) }, admin.name)
  }

  return (
    <>
      <PageHeader title="Categorías" description="Organiza el catálogo. Solo puedes eliminar categorías sin productos." />
      <form onSubmit={add} className="mb-6 flex max-w-md flex-col gap-2">
        <label htmlFor="new-category" className="text-sm font-medium">
          Nueva categoría
        </label>
        <div className="flex gap-2">
          <Input
            id="new-category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Hogar"
            aria-invalid={!!error}
          />
          <Button type="submit">
            <Plus data-icon="inline-start" />
            Agregar
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = db.products.filter((p) => p.category === c).length
          return (
            <li key={c} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{c}</span>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? "producto" : "productos"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={count > 0}
                onClick={() => remove(c)}
                aria-label={`Eliminar ${c}`}
                title={count > 0 ? "Tiene productos asignados" : "Eliminar"}
              >
                <Trash2 />
              </Button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
