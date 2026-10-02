import type { Database } from "@/lib/types"
import { startOfDay } from "@/lib/commissions"

const DAY_MS = 24 * 60 * 60 * 1000

export interface DailyPoint {
  day: string
  label: string
  generated: number
  redeemed: number
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Offers generated and redeemed per day, oldest first, including today. */
export function dailySeries(db: Database, days = 14, now = new Date()): DailyPoint[] {
  const today = startOfDay(now).getTime()
  const points = new Map<string, DailyPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today - i * DAY_MS)
    points.set(dayKey(d), {
      day: dayKey(d),
      label: d.toLocaleDateString("es", { day: "2-digit", month: "short" }),
      generated: 0,
      redeemed: 0,
    })
  }
  for (const o of db.offers) {
    const created = points.get(dayKey(new Date(o.createdAt)))
    if (created) created.generated++
    if (o.redeemedAt) {
      const redeemed = points.get(dayKey(new Date(o.redeemedAt)))
      if (redeemed) redeemed.redeemed++
    }
  }
  return [...points.values()]
}

export interface ProductPoint {
  name: string
  generated: number
  redeemed: number
}

/** Products with the most offers generated, with how many were redeemed. */
export function topProducts(db: Database, limit = 5): ProductPoint[] {
  const byProduct = new Map<string, ProductPoint>()
  for (const o of db.offers) {
    const entry = byProduct.get(o.productId) ?? { name: o.productName, generated: 0, redeemed: 0 }
    entry.generated++
    if (o.redeemedAt) entry.redeemed++
    byProduct.set(o.productId, entry)
  }
  return [...byProduct.values()].sort((a, b) => b.generated - a.generated || b.redeemed - a.redeemed).slice(0, limit)
}
