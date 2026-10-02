"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-db"
import { logout, ROLE_LABEL } from "@/lib/session"
import { initials } from "@/lib/format"
import type { Role } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Brand } from "@/components/app/brand"
import { navFor } from "@/components/app/nav-config"
import { SidebarNav } from "@/components/app/sidebar-nav"

const ROLE_SCOPE: Record<Role, string> = {
  superadmin: "Control total del sistema",
  admin: "Gestión de productos",
  promoter: "Panel de ventas",
}

function SidebarBody({
  storeName,
  role,
  userName,
  pathname,
  onNavigate,
  onLogout,
}: {
  storeName: string
  role: Role
  userName: string
  pathname: string
  onNavigate?: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4 text-sidebar-accent-foreground">
        <Brand name={storeName} inverted />
        <div className="flex flex-col rounded-lg border border-sidebar-border px-3 py-2">
          <span className="text-xs font-semibold text-sidebar-primary">{ROLE_LABEL[role]}</span>
          <span className="text-xs text-sidebar-foreground">{ROLE_SCOPE[role]}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <SidebarNav groups={navFor(role)} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-t border-sidebar-border p-4">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground"
        >
          {initials(userName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{userName}</p>
          <p className="truncate text-xs">{ROLE_LABEL[role]}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onLogout}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Cerrar sesión"
        >
          <LogOut />
        </Button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { db, current } = useCurrentUser()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  if (!db || !current) return null

  const storeName = db.settings.storeName

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  const body = (onNavigate?: () => void) => (
    <SidebarBody
      storeName={storeName}
      role={current.role}
      userName={current.user.name}
      pathname={pathname}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    />
  )

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh md:block">{body()}</aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-2 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu />
          </Button>
          <Brand name={storeName} />
          <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {ROLE_LABEL[current.role]}
          </span>
        </header>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-72 gap-0 border-sidebar-border p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú de {ROLE_LABEL[current.role]}</SheetTitle>
            <SheetDescription className="sr-only">Navegación del panel</SheetDescription>
            {body(() => setMenuOpen(false))}
          </SheetContent>
        </Sheet>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  )
}
