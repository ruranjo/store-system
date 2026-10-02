import type { AdminUser, Database, Promoter, Role } from "@/lib/types"
import { commit, getDb } from "@/lib/storage/db"
import { DEMO_PASSWORD } from "@/lib/users"

export type CurrentUser =
  | { role: "superadmin" | "admin"; user: AdminUser }
  | { role: "promoter"; user: Promoter }

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  promoter: "Promotor",
}

export function homeFor(role: Role) {
  return role === "promoter" ? "/promotor" : "/admin"
}

export function resolveCurrentUser(db: Database): CurrentUser | null {
  const s = db.session
  if (!s) return null
  if (s.role === "promoter") {
    const user = db.promoters.find((p) => p.id === s.userId)
    return user && user.status === "active" ? { role: "promoter", user } : null
  }
  const user = db.users.find((u) => u.id === s.userId)
  return user ? { role: user.role, user } : null
}

const INVALID = "Usuario o contraseña incorrectos."

/** Demo login: username lookup plus the shared demo password for that role. */
export function login(
  username: string,
  password: string,
): { ok: true; role: Role } | { ok: false; error: string } {
  const db = getDb()
  const name = username.trim().toLowerCase()
  const admin = db.users.find((u) => u.username.toLowerCase() === name)
  if (admin) {
    if (password !== DEMO_PASSWORD[admin.role]) return { ok: false, error: INVALID }
    commit({ session: { role: admin.role, userId: admin.id, startedAt: new Date().toISOString() } })
    return { ok: true, role: admin.role }
  }
  const promoter = db.promoters.find((p) => p.username.toLowerCase() === name)
  if (promoter) {
    if (password !== DEMO_PASSWORD.promoter) return { ok: false, error: INVALID }
    if (promoter.status !== "active") return { ok: false, error: "Este promotor está desactivado." }
    commit({ session: { role: "promoter", userId: promoter.id, startedAt: new Date().toISOString() } })
    return { ok: true, role: "promoter" }
  }
  return { ok: false, error: INVALID }
}

export function logout() {
  commit({ session: null })
}
