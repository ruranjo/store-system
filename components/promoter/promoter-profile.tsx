"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { usePromoter } from "@/hooks/use-promoter"
import { logout } from "@/lib/session"
import { offersForPromoter } from "@/lib/offers"
import { formatDate, initials } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"

export function PromoterProfile() {
  const ctx = usePromoter()
  const router = useRouter()
  if (!ctx) return null
  const { db, promoter } = ctx
  const total = offersForPromoter(db, promoter.id).length

  const rows: [string, React.ReactNode][] = [
    ["Código", <span key="c" className="font-mono font-semibold">{promoter.code}</span>],
    ["Usuario", promoter.username],
    ["Correo", promoter.email || "—"],
    ["Teléfono", promoter.phone || "—"],
    ["Registrado", formatDate(promoter.createdAt)],
    ["Ofertas generadas", total],
  ]

  return (
    <>
      <PageHeader title="Perfil" />
      <div className="flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            {initials(promoter.name)}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{promoter.name}</p>
            <StatusBadge status={promoter.status} className="w-fit" />
          </div>
        </div>
        <dl className="divide-y rounded-xl border bg-card">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="truncate text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <Button
          variant="outline"
          size="lg"
          className="w-fit"
          onClick={() => {
            logout()
            router.replace("/login")
          }}
        >
          <LogOut data-icon="inline-start" aria-hidden="true" />
          Cerrar sesión
        </Button>
      </div>
    </>
  )
}
