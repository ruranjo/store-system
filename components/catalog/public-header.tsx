"use client"

import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-db"
import { homeFor } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Brand } from "@/components/app/brand"

export function PublicHeader() {
  const { db, current } = useCurrentUser()
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" aria-label="Ir al catálogo">
          <Brand name={db?.settings.storeName} />
        </Link>
        {db && (
          <Button
            variant="outline"
            size="lg"
            render={<Link href={current ? homeFor(current.role) : "/login"} />}
            nativeButton={false}
          >
            {current ? "Mi panel" : "Ingresar"}
          </Button>
        )}
      </div>
    </header>
  )
}
