import type { Database, Product, Status } from "@/lib/types"
import { commit, getDb, uid } from "@/lib/storage/db"
import { withActivity } from "@/lib/activity"

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">

export function activeProducts(db: Database) {
  return db.products.filter((p) => p.status === "active")
}

export function findProduct(db: Database, id: string) {
  return db.products.find((p) => p.id === id)
}

export function validateProduct(input: ProductInput, ignoreId?: string): string | null {
  if (!input.name.trim()) return "El nombre es obligatorio."
  if (!input.sku.trim()) return "El SKU es obligatorio."
  if (!Number.isFinite(input.price) || input.price <= 0) return "El precio debe ser mayor que 0."
  if (input.compareAtPrice !== undefined && input.compareAtPrice <= input.price)
    return "El precio anterior debe ser mayor que el precio actual."
  const sku = input.sku.trim().toUpperCase()
  if (getDb().products.some((p) => p.sku.toUpperCase() === sku && p.id !== ignoreId))
    return "Ya existe un producto con ese SKU."
  return null
}

export function createProduct(input: ProductInput, actor: string) {
  const error = validateProduct(input)
  if (error) throw new Error(error)
  const now = new Date().toISOString()
  const product: Product = { ...input, sku: input.sku.trim().toUpperCase(), id: uid("prod-"), createdAt: now, updatedAt: now }
  commit({
    products: [product, ...getDb().products],
    activity: withActivity("product_created", actor, `creó el producto "${product.name}"`),
  })
  return product
}

export function updateProduct(id: string, input: ProductInput, actor: string) {
  const error = validateProduct(input, id)
  if (error) throw new Error(error)
  const products = getDb().products.map((p) =>
    p.id === id ? { ...p, ...input, sku: input.sku.trim().toUpperCase(), updatedAt: new Date().toISOString() } : p,
  )
  commit({
    products,
    activity: withActivity("product_updated", actor, `actualizó el producto "${input.name}"`),
  })
}

export function setProductStatus(id: string, status: Status, actor: string) {
  const product = findProduct(getDb(), id)
  if (!product) return
  commit({
    products: getDb().products.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p)),
    activity: withActivity(
      "product_updated",
      actor,
      `${status === "active" ? "activó" : "desactivó"} el producto "${product.name}"`,
    ),
  })
}

export function deleteProduct(id: string, actor: string) {
  const product = findProduct(getDb(), id)
  if (!product) return
  commit({
    products: getDb().products.filter((p) => p.id !== id),
    activity: withActivity("product_deleted", actor, `eliminó el producto "${product.name}"`),
  })
}
