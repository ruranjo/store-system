import type { Database, Role } from "@/lib/types"

/** Demo-only passwords, one per role. Not real security — this app runs entirely in the browser. */
export const DEMO_PASSWORD: Record<Role, string> = {
  superadmin: "super123",
  admin: "admin123",
  promoter: "promo123",
}

export interface DemoCredential {
  username: string
  password: string
  name: string
  role: Role
  detail: string
}

/** One sign-in per role (super admin, admin, first active promoter) for the demo login screen. */
export function demoCredentials(db: Database): DemoCredential[] {
  const result: DemoCredential[] = []
  const superadmin = db.users.find((u) => u.role === "superadmin")
  const admin = db.users.find((u) => u.role === "admin")
  const promoter = db.promoters.find((p) => p.status === "active")

  if (superadmin)
    result.push({
      username: superadmin.username,
      password: DEMO_PASSWORD.superadmin,
      name: superadmin.name,
      role: "superadmin",
      detail: "Control total",
    })
  if (admin)
    result.push({
      username: admin.username,
      password: DEMO_PASSWORD.admin,
      name: admin.name,
      role: "admin",
      detail: "Gestión de productos",
    })
  if (promoter)
    result.push({
      username: promoter.username,
      password: DEMO_PASSWORD.promoter,
      name: promoter.name,
      role: "promoter",
      detail: `Código ${promoter.code}`,
    })
  return result
}
