export type Role = "superadmin" | "admin" | "promoter"

export type Status = "active" | "inactive"

export interface AdminUser {
  id: string
  username: string
  name: string
  role: Exclude<Role, "promoter">
  email: string
}

export interface Promoter {
  id: string
  username: string
  name: string
  code: string
  email: string
  phone: string
  status: Status
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  compareAtPrice?: number
  category: string
  sku: string
  status: Status
  createdAt: string
  updatedAt: string
}

export type OfferStatus = "active" | "expired" | "cancelled" | "redeemed"

export interface Offer {
  id: string
  code: string
  promoterId: string
  promoterName: string
  promoterCode: string
  productId: string
  productName: string
  productPrice: number
  discount: number
  hourKey: string
  createdAt: string
  cancelled?: boolean
  redeemedAt?: string
  redeemedBy?: string
  commission?: number
}

export interface Session {
  role: Role
  userId: string
  startedAt: string
}

export interface Settings {
  storeName: string
  whatsappNumber: string
  maxDiscount: number
  offerValidityHours: number
  currency: string
  categories: string[]
  /** Percent of the discounted sale price paid to the promoter per redemption. */
  commissionRate: number
  dailyGoal: number
  weeklyGoal: number
}

export type ActivityType =
  | "offer_created"
  | "offer_cancelled"
  | "offer_redeemed"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "promoter_created"
  | "promoter_updated"
  | "settings_updated"

export interface Activity {
  id: string
  type: ActivityType
  message: string
  actor: string
  at: string
}

export interface Database {
  users: AdminUser[]
  promoters: Promoter[]
  products: Product[]
  offers: Offer[]
  activity: Activity[]
  settings: Settings
  session: Session | null
}
