import { PublicHeader } from "@/components/catalog/public-header"

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  )
}
