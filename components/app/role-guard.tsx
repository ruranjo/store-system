"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-db"
import { homeFor } from "@/lib/session"
import type { Role } from "@/lib/types"
import { FullscreenLoader } from "@/components/app/fullscreen-loader"

export function RoleGuard({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { db, current } = useCurrentUser()
  const router = useRouter()
  const allowed = !!current && roles.includes(current.role)

  useEffect(() => {
    if (db && !allowed) router.replace(current ? homeFor(current.role) : "/login")
  }, [db, allowed, current, router])

  if (!db || !allowed) return <FullscreenLoader />
  return <>{children}</>
}
