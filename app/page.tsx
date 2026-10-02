import { PublicHeader } from "@/components/catalog/public-header"
import { PublicCatalog } from "@/components/catalog/public-catalog"

export default function Page() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <PublicCatalog />
      </main>
    </div>
  )
}
