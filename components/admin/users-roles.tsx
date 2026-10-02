"use client"

import { useAdmin } from "@/hooks/use-promoter"
import { ROLE_LABEL } from "@/lib/session"
import { initials } from "@/lib/format"
import type { Role } from "@/lib/types"
import { PageHeader } from "@/components/app/page-header"

const PERMISSIONS: Record<Role, string[]> = {
  superadmin: ["Productos y categorías", "Promotores", "Todas las ofertas", "Configuración del sistema"],
  admin: ["Productos y categorías", "Resumen y actividad", "Vista previa del catálogo"],
  promoter: ["Catálogo", "Generar y compartir ofertas", "Su perfil y estadísticas"],
}

export function UsersRoles() {
  const ctx = useAdmin()
  if (!ctx) return null
  const { db } = ctx
  const people: { id: string; name: string; detail: string; role: Role }[] = [
    ...db.users.map((u) => ({ id: u.id, name: u.name, detail: u.email, role: u.role as Role })),
    ...db.promoters.map((p) => ({ id: p.id, name: p.name, detail: `${p.code} · ${p.email}`, role: "promoter" as Role })),
  ]

  return (
    <>
      <PageHeader title="Usuarios y roles" description="Quién tiene acceso al sistema y qué puede hacer cada rol." />
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PERMISSIONS) as Role[]).map((role) => (
          <section key={role} aria-labelledby={`role-${role}`} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 id={`role-${role}`} className="font-semibold">
                {ROLE_LABEL[role]}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {people.filter((p) => p.role === role).length}
              </span>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {PERMISSIONS[role].map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
            <ul className="mt-1 flex flex-col gap-2 border-t pt-3">
              {people
                .filter((p) => p.role === role)
                .map((p) => (
                  <li key={p.id} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
                    >
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.detail}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
