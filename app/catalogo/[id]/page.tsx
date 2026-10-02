import { ProductDetail } from "@/components/catalog/product-detail"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ oferta?: string | string[] }>
}) {
  const { id } = await params
  const { oferta } = await searchParams
  const offerCode = typeof oferta === "string" && oferta.length <= 40 ? oferta : undefined
  return <ProductDetail productId={id} backHref="/" offerCode={offerCode} mode="public" />
}
