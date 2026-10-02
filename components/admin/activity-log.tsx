"use client"

import { useState } from "react"
import { useAdmin } from "@/hooks/use-promoter"
import { formatDateTime, timeAgo } from "@/lib/format"
import type { ActivityType } from "@/lib/types"
import { PageHeader } from "@/components/app/page-header"
import { NativeSelect } from "@/components/app/native-select"

const GROUPS: Record<string, { label: string; types: ActivityType[] }> = {
  all: { label: "Todo", types: [] },
  offers: { label: "Ofertas", types: ["offer_created", "offer_cancelled"] },
  products: { label: "Productos", types: ["product_created", "product_updated", "product_deleted"] },
  promoters: { label: "Promotores", types: ["promoter_created", "promoter_updated"] },
  settings: { label: "Configuración", types: ["settings_updated"] },
}

export function ActivityLog() {
  const ctx = useAdmin()
  const [group, setGroup] = useState("all")
  if (!ctx) return null
  const types = GROUPS[group].types
  const items = types.length ? ctx.db.activity.filter((a) => types.includes(a.type)) : ctx.db.activity

  return (
    <>
      <PageHeader
        title="Actividad"
        description="Registro de cambios hechos por administradores y promotores."
        actions={
          <NativeSelect aria-label="Tipo de actividad" value={group} onChange={(e) => setGroup(e.target.value)}>
            {Object.entries(GROUPS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </NativeSelect>
        }
      />
      <div className="rounded-xl border bg-card">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Sin actividad en esta categoría.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {items.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="text-sm text-pretty">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.message}</span>
                </span>
                <time dateTime={a.at} title={formatDateTime(a.at)} className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(a.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
