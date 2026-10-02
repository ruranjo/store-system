import type { Database, Offer, OfferStatus } from "@/lib/types"
import { commit, getDb, uid } from "@/lib/storage/db"
import { withActivity } from "@/lib/activity"
import { buildOfferCode, hourKeyOf } from "@/lib/offers/code"

export { hourKeyOf } from "@/lib/offers/code"

export const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 30]

export function offerStatus(offer: Offer, validityHours: number, now = Date.now()): OfferStatus {
  if (offer.cancelled) return "cancelled"
  if (offer.redeemedAt) return "redeemed"
  const expires = new Date(offer.createdAt).getTime() + validityHours * 3_600_000
  return now > expires ? "expired" : "active"
}

export function offerExpiresAt(offer: Offer, validityHours: number) {
  return new Date(new Date(offer.createdAt).getTime() + validityHours * 3_600_000)
}

export function discountedPrice(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100) * 100) / 100
}

export function sortedOffers(db: Database) {
  return [...db.offers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function offersForPromoter(db: Database, promoterId: string) {
  return sortedOffers(db).filter((o) => o.promoterId === promoterId)
}

export function findOfferByCode(db: Database, code: string) {
  const c = code.trim().toUpperCase()
  return db.offers.find((o) => o.code === c)
}

/** Existing offer for promoter + product within the current local hour, if any. */
export function findOfferThisHour(db: Database, promoterId: string, productId: string, now = new Date()) {
  const key = hourKeyOf(now)
  return db.offers.find((o) => o.promoterId === promoterId && o.productId === productId && o.hourKey === key)
}

export function isToday(iso: string, now = new Date()) {
  return new Date(iso).toDateString() === now.toDateString()
}

export type CreateOfferResult =
  | { ok: true; offer: Offer }
  | { ok: false; reason: "duplicate"; offer: Offer }
  | { ok: false; reason: "invalid"; error: string }

export function createOffer(promoterId: string, productId: string, discount: number): CreateOfferResult {
  const db = getDb()
  const promoter = db.promoters.find((p) => p.id === promoterId)
  const product = db.products.find((p) => p.id === productId)
  if (!promoter || promoter.status !== "active") return { ok: false, reason: "invalid", error: "Promotor no válido." }
  if (!product || product.status !== "active")
    return { ok: false, reason: "invalid", error: "El producto no está disponible." }
  if (!Number.isInteger(discount) || discount < 1 || discount > db.settings.maxDiscount)
    return { ok: false, reason: "invalid", error: `El descuento debe estar entre 1% y ${db.settings.maxDiscount}%.` }

  const now = new Date()
  const existing = findOfferThisHour(db, promoterId, productId, now)
  if (existing) return { ok: false, reason: "duplicate", offer: existing }

  const code = buildOfferCode(promoter.code, product.sku, new Set(db.offers.map((o) => o.code)))
  const offer: Offer = {
    id: uid("off-"),
    code,
    promoterId,
    promoterName: promoter.name,
    promoterCode: promoter.code,
    productId,
    productName: product.name,
    productPrice: product.price,
    discount,
    hourKey: hourKeyOf(now),
    createdAt: now.toISOString(),
  }
  commit({
    offers: [offer, ...db.offers],
    activity: withActivity("offer_created", promoter.name, `generó una oferta de ${discount}% para "${product.name}"`),
  })
  return { ok: true, offer }
}

export function redeemedOffers(db: Database) {
  return db.offers
    .filter((o) => o.redeemedAt)
    .sort((a, b) => (b.redeemedAt ?? "").localeCompare(a.redeemedAt ?? ""))
}

export type RedeemResult = { ok: true; offer: Offer } | { ok: false; error: string; offer?: Offer }

export function redeemOffer(code: string, actor: string): RedeemResult {
  const db = getDb()
  const offer = findOfferByCode(db, code)
  if (!offer) return { ok: false, error: "No existe ninguna oferta con ese código." }
  const status = offerStatus(offer, db.settings.offerValidityHours)
  if (status === "redeemed") return { ok: false, error: "Este código ya fue canjeado.", offer }
  if (status === "cancelled") return { ok: false, error: "Este código fue anulado por un administrador.", offer }
  if (status === "expired") return { ok: false, error: "Este código ya venció.", offer }

  const commission =
    Math.round(discountedPrice(offer.productPrice, offer.discount) * db.settings.commissionRate) / 100
  const redeemed: Offer = { ...offer, redeemedAt: new Date().toISOString(), redeemedBy: actor, commission }
  commit({
    offers: db.offers.map((o) => (o.id === offer.id ? redeemed : o)),
    activity: withActivity("offer_redeemed", actor, `canjeó la oferta ${offer.code} (${offer.promoterName})`),
  })
  return { ok: true, offer: redeemed }
}

export function cancelOffer(id: string, actor: string) {
  const db = getDb()
  const offer = db.offers.find((o) => o.id === id)
  if (!offer) return
  commit({
    offers: db.offers.map((o) => (o.id === id ? { ...o, cancelled: true } : o)),
    activity: withActivity("offer_cancelled", actor, `anuló la oferta ${offer.code}`),
  })
}
