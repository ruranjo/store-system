"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import type { Settings } from "@/lib/types"
import { useAdmin } from "@/hooks/use-promoter"
import { resetDemoData, updateSettings } from "@/lib/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/app/page-header"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { NativeSelect } from "@/components/app/native-select"

const CURRENCIES = ["USD", "MXN", "COP", "PEN", "ARS", "CLP", "EUR"]

export function SettingsScreen() {
  const ctx = useAdmin()
  if (!ctx) return null
  return (
    <SettingsForm
      key={JSON.stringify(ctx.db.settings)}
      settings={ctx.db.settings}
      actor={ctx.admin.name}
    />
  )
}

function SettingsForm({ settings, actor }: { settings: Settings; actor: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
    maxDiscount: String(settings.maxDiscount),
    offerValidityHours: String(settings.offerValidityHours),
    currency: settings.currency,
    categories: settings.categories.join("\n"),
    commissionRate: String(settings.commissionRate),
    dailyGoal: String(settings.dailyGoal),
    weeklyGoal: String(settings.weeklyGoal),
  })
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      updateSettings(
        {
          storeName: form.storeName.trim(),
          whatsappNumber: form.whatsappNumber.replace(/\D/g, ""),
          maxDiscount: Number(form.maxDiscount),
          offerValidityHours: Number(form.offerValidityHours),
          currency: form.currency,
          categories: form.categories.split(/[\n,]/),
          commissionRate: Number(form.commissionRate),
          dailyGoal: Number(form.dailyGoal),
          weeklyGoal: Number(form.weeklyGoal),
        },
        actor,
      )
      toast.success("Configuración guardada")
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <PageHeader title="Ajustes" description="Reglas de la tienda y de las ofertas." />
      <form onSubmit={submit} noValidate className="flex max-w-2xl flex-col gap-8">
        <fieldset className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-sm font-semibold">Tienda</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-name">Nombre</Label>
              <Input id="s-name" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} maxLength={40} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-currency">Moneda</Label>
              <NativeSelect id="s-currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-wa">WhatsApp de ventas</Label>
            <Input
              id="s-wa"
              type="tel"
              inputMode="numeric"
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              aria-describedby="s-wa-hint"
              className="font-mono"
            />
            <p id="s-wa-hint" className="text-xs text-muted-foreground">
              Con código de país, sin espacios. Ej. 5215512345678
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-cats">Categorías</Label>
            <Textarea
              id="s-cats"
              rows={4}
              value={form.categories}
              onChange={(e) => set("categories", e.target.value)}
              aria-describedby="s-cats-hint"
            />
            <p id="s-cats-hint" className="text-xs text-muted-foreground">
              Una por línea.
            </p>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-sm font-semibold">Ofertas</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-max">Descuento máximo (%)</Label>
              <Input
                id="s-max"
                type="number"
                min={1}
                max={90}
                value={form.maxDiscount}
                onChange={(e) => set("maxDiscount", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-valid">Vigencia (horas)</Label>
              <Input
                id="s-valid"
                type="number"
                min={1}
                value={form.offerValidityHours}
                onChange={(e) => set("offerValidityHours", e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cada promotor puede generar una sola oferta por producto dentro de la misma hora.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-sm font-semibold">Comisiones y metas</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-rate">Comisión (%)</Label>
              <Input
                id="s-rate"
                type="number"
                min={0}
                max={50}
                step="0.5"
                value={form.commissionRate}
                onChange={(e) => set("commissionRate", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-daily">Meta diaria (canjes)</Label>
              <Input
                id="s-daily"
                type="number"
                min={1}
                value={form.dailyGoal}
                onChange={(e) => set("dailyGoal", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-weekly">Meta semanal (canjes)</Label>
              <Input
                id="s-weekly"
                type="number"
                min={1}
                value={form.weeklyGoal}
                onChange={(e) => set("weeklyGoal", e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            La comisión se calcula sobre el precio con descuento y queda fija al momento del canje.
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" size="lg">
            Guardar cambios
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => setConfirmReset(true)}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Restaurar datos de demo
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Restaurar datos de demo"
        description="Se borrarán productos, promotores, ofertas y ajustes actuales, y se cerrará la sesión."
        confirmLabel="Restaurar"
        destructive
        onConfirm={() => {
          resetDemoData()
          router.replace("/login")
        }}
      />
    </>
  )
}
