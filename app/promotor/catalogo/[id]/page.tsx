import { ProductDetail } from "@/components/catalog/product-detail"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetail productId={id} backHref="/promotor/catalogo" mode="promoter" />
}
