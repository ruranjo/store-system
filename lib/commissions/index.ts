import type { Database, Offer, Promoter } from "@/lib/types"
import { discountedPrice } from "@/lib/offers"

/** Stored at redemption; older demo redemptions fall back to the current rate. */
export function offerCommission(offer: Offer, rate: number) {
  return offer.commission ?? Math.round(discountedPrice(offer.productPrice, offer.discount) * rate) / 100
}

export function startOfDay(now = new Date()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Weeks start on Monday. */
export function startOfWeek(now = new Date()) {
  const d = startOfDay(now)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export interface Earnings {
  promoter: Promoter
  generated: number
  redeemedToday: number
  redeemedWeek: number
  redeemedTotal: number
  earnedToday: number
  earnedWeek: number
  earnedTotal: number
  conversion: number
}

export function earningsFor(db: Database, promoter: Promoter, now = new Date()): Earnings {
  const rate = db.settings.commissionRate
  const day = startOfDay(now).getTime()
  const week = startOfWeek(now).getTime()
  const mine = db.offers.filter((o) => o.promoterId === promoter.id && !o.cancelled)
  const redeemed = mine.filter((o) => o.redeemedAt)
  const sum = (list: Offer[]) => Math.round(list.reduce((s, o) => s + offerCommission(o, rate), 0) * 100) / 100
  const since = (t: number) => redeemed.filter((o) => new Date(o.redeemedAt as string).getTime() >= t)
  const today = since(day)
  const thisWeek = since(week)
  return {
    promoter,
    generated: mine.length,
    redeemedToday: today.length,
    redeemedWeek: thisWeek.length,
    redeemedTotal: redeemed.length,
    earnedToday: sum(today),
    earnedWeek: sum(thisWeek),
    earnedTotal: sum(redeemed),
    conversion: mine.length ? redeemed.length / mine.length : 0,
  }
}

/** Active promoters ranked by redemptions this week, then by earnings. */
export function leaderboard(db: Database, now = new Date()) {
  return db.promoters
    .filter((p) => p.status === "active")
    .map((p) => earningsFor(db, p, now))
    .sort((a, b) => b.redeemedWeek - a.redeemedWeek || b.earnedWeek - a.earnedWeek || b.earnedTotal - a.earnedTotal)
}

export function recentRedemptions(db: Database, promoterId: string, limit = 8) {
  return db.offers
    .filter((o) => o.promoterId === promoterId && o.redeemedAt)
    .sort((a, b) => (b.redeemedAt ?? "").localeCompare(a.redeemedAt ?? ""))
    .slice(0, limit)
}
