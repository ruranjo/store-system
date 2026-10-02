import type { Metadata } from "next"
import { PublicCoupon } from "@/components/offers/public-coupon"

export const metadata: Metadata = {
  title: "Tu cupón de descuento",
  description: "Muestra este cupón en caja para recibir tu descuento.",
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <PublicCoupon code={decodeURIComponent(code)} />
}
