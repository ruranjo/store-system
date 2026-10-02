const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Local-time bucket used for the "one offer per promoter + product per hour" rule. */
export function hourKeyOf(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}`
}

function randomChunk(length: number) {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

/**
 * Format: P001-AUD01-K7Q4
 *  - P001  → promoter code (PROMO-001)
 *  - AUD01 → product SKU
 *  - K7Q4  → random suffix, regenerated until unique
 */
export function buildOfferCode(promoterCode: string, sku: string, existing: Set<string>) {
  const promo = promoterCode.replace(/^PROMO-?/i, "P").toUpperCase()
  const product = sku.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6) || "PROD"
  let code = ""
  do {
    code = `${promo}-${product}-${randomChunk(4)}`
  } while (existing.has(code))
  return code
}
