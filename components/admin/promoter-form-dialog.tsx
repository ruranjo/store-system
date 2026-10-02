"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { Promoter } from "@/lib/types"
import { createPromoter, nextPromoterCode, updatePromoter } from "@/lib/promoters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function PromoterFormDialog({
  open,
  onOpenChange,
  promoter,
  actor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  promoter?: Promoter
  actor: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <PromoterForm key={promoter?.id ?? "new"} promoter={promoter} actor={actor} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PromoterForm({ promoter, actor, onDone }: { promoter?: Promoter; actor: string; onDone: () => void }) {
  const [form, setForm] = useState({
    name: promoter?.name ?? "",
    username: promoter?.username ?? "",
    email: promoter?.email ?? "",
    phone: promoter?.phone ?? "",
    active: promoter ? promoter.status === "active" : true,
  })
  const [error, setError] = useState<string | null>(null)
  const [code] = useState(() => promoter?.code ?? nextPromoterCode())

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const input = {
      name: form.name.trim(),
      username: form.username,
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.active ? ("active" as const) : ("inactive" as const),
    }
    try {
      if (promoter) updatePromoter(promoter.id, input, actor)
      else createPromoter(input, actor)
      toast.success(promoter ? "Promotor actualizado" : `Promotor ${code} registrado`)
      onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <DialogHeader>
        <DialogTitle>{promoter ? "Editar promotor" : "Nuevo promotor"}</DialogTitle>
        <DialogDescription>
          Código asignado: <span className="font-mono font-semibold text-foreground">{code}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pr-name">Nombre completo</Label>
        <Input id="pr-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pr-user">Usuario de acceso</Label>
        <Input
          id="pr-user"
          value={form.username}
          onChange={(e) => set("username", e.target.value)}
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pr-email">Correo</Label>
          <Input id="pr-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pr-phone">Teléfono</Label>
          <Input id="pr-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
        <Label htmlFor="pr-active" className="flex flex-col items-start gap-0.5">
          <span>Cuenta activa</span>
          <span className="text-xs font-normal text-muted-foreground">Los inactivos no pueden ingresar.</span>
        </Label>
        <Switch id="pr-active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" size="lg">
          {promoter ? "Guardar cambios" : "Registrar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
