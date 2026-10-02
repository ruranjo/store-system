import type { Promoter, Status } from "@/lib/types"
import { commit, getDb, uid } from "@/lib/storage/db"
import { withActivity } from "@/lib/activity"

export type PromoterInput = Pick<Promoter, "name" | "username" | "email" | "phone" | "status">

export function nextPromoterCode() {
  const max = getDb().promoters.reduce((m, p) => {
    const n = Number.parseInt(p.code.replace(/\D/g, ""), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `PROMO-${String(max + 1).padStart(3, "0")}`
}

function validate(input: PromoterInput, ignoreId?: string): string | null {
  if (!input.name.trim()) return "El nombre es obligatorio."
  const username = input.username.trim().toLowerCase()
  if (!/^[a-z0-9._-]{3,}$/.test(username))
    return "El usuario debe tener al menos 3 caracteres (letras, números, punto o guion)."
  const db = getDb()
  const taken =
    db.users.some((u) => u.username.toLowerCase() === username) ||
    db.promoters.some((p) => p.username.toLowerCase() === username && p.id !== ignoreId)
  if (taken) return "Ese nombre de usuario ya está en uso."
  return null
}

export function createPromoter(input: PromoterInput, actor: string) {
  const error = validate(input)
  if (error) throw new Error(error)
  const promoter: Promoter = {
    ...input,
    username: input.username.trim().toLowerCase(),
    id: uid("pro-"),
    code: nextPromoterCode(),
    createdAt: new Date().toISOString(),
  }
  commit({
    promoters: [...getDb().promoters, promoter],
    activity: withActivity("promoter_created", actor, `registró al promotor ${promoter.name} (${promoter.code})`),
  })
  return promoter
}

export function updatePromoter(id: string, input: PromoterInput, actor: string) {
  const error = validate(input, id)
  if (error) throw new Error(error)
  commit({
    promoters: getDb().promoters.map((p) =>
      p.id === id ? { ...p, ...input, username: input.username.trim().toLowerCase() } : p,
    ),
    activity: withActivity("promoter_updated", actor, `actualizó al promotor ${input.name}`),
  })
}

export function setPromoterStatus(id: string, status: Status, actor: string) {
  const promoter = getDb().promoters.find((p) => p.id === id)
  if (!promoter) return
  const db = getDb()
  const kickSession = status === "inactive" && db.session?.role === "promoter" && db.session.userId === id
  commit({
    promoters: db.promoters.map((p) => (p.id === id ? { ...p, status } : p)),
    activity: withActivity(
      "promoter_updated",
      actor,
      `${status === "active" ? "activó" : "desactivó"} al promotor ${promoter.name}`,
    ),
    ...(kickSession ? { session: null } : {}),
  })
}
